drop table if exists racing_event;
drop table if exists race;
drop table if exists organisation;
drop table if exists individual_class;
drop table if exists course_family;
drop table if exists allowed_class_course;
drop table if exists control;
drop table if exists actual_course;
drop table if exists course_control;
drop table if exists split_time;
drop table if exists individual_registration;
drop table if exists person_result;
drop table if exists person;
drop table if exists team;
drop table if exists team_class;
drop table if exists team_member_class;
drop table if exists team_member;
drop table if exists startlist_config;

-- a single line table (one event per SQLite DB)
create table racing_event (
   uuid    text not null,
   name    text         ,
   website text,
   constraint pk_racing_event primary key (uuid)
);

-- a single race (eg a MD)
create table race (
   id         integer  not null,
   name       text     not null,
   form       text     not null,  -- INDIVIDUAL | RELAY | ...
   racing_event_uuid text not null,
   start_mode text     not null,
   start_timestamp integer,        -- defaults to today - 00:00
   bib_course_assignment text, -- JSON storing the bib/course assignments so that any new bib is given the proper course
   constraint pk_race primary key (id),
   foreign key(racing_event_uuid) references racing_event(uuid) on delete cascade

)   ;

-- club, country...
create table organisation (
   id         integer not null,
   name       text    not null,
   short_name text  not null,
   constraint pk_organisation primary key (id)
)   ;

-- as defined in the race
create table individual_class (
   id          integer not null,
   short_name  text    not null,
   name        text            ,
   allowed_sex text    not null, -- M or F or 'M|F' for both
   min_age     integer         ,
   max_age     integer         ,
   race_id     integer not null,
   constraint pk_individual_class primary key (id),
   foreign key(race_id) references race(id) on delete cascade
)   ;

-- visible from competitors
create table course_family (
   id            integer not null,
   name          text    not null,
   race_id       integer not null,
   display_color text            ,
   constraint pk_course_family primary key (id),
   foreign key(race_id) references race(id) on delete cascade
)   ;

-- to compute start-times
create table startlist_config (
   id              integer  not null,
   start_timestamp integer not null,
   interval_s      integer  not null,
   min_vacancy_pct integer  not null,
   corridor_number integer          ,
   constraint pk_startlist_config primary key (id)
)   ;


-- allowed combinations
create table allowed_class_course (
   has_bibs                integer  not null, -- boolean used to validate UI
   is_ranked               integer not null, -- boolean
   is_timed                integer not null, -- boolean
   individual_class_id     integer not null,
   course_family_id     integer not null,
   startlist_config_id integer         ,
   constraint pk_allowed_class_course primary key (course_family_id, individual_class_id),
   foreign key(individual_class_id) references individual_class(id) on delete cascade,
   foreign key(course_family_id) references course_family(id) on delete cascade,
   foreign key(startlist_config_id) references startlist_config(id)
)   ;

-- shared amongst all courses in a race
create table control (
   id           integer not null,
   control_code text    not null,
   control_type text    not null,
   is_radio     integer not null, -- boolean
   name         text            ,
   constraint pk_control primary key (id)
)   ;

-- hidden from competitors
create table actual_course (
   id               integer not null,
   name             text    not null,
   length_m         integer         ,
   climb_m          integer         ,
   course_family_id integer not null,
   constraint pk_actual_course primary key (id),
   foreign key(course_family_id) references course_family(id) on delete cascade
)   ;

-- a control on a course, free order : seq_num=null
create table course_control (
   id           integer not null,
   seq_num      integer         ,
   score        integer         ,
   leg_length_m integer         ,
   control_id   integer not null,
   actual_course_id  integer  not null ,
   constraint pk_course_control primary key (id),
   foreign key(actual_course_id) references actual_course(id) on delete cascade,
   constraint fk_course_control_control_id foreign key(control_id) references control(id)
)   ;

-- for all races
create table person (
   id               integer not null,
   external_key     text          , -- federal number for instance
   ecard            text          ,
   first_name       text            ,
   last_name        text            ,
   sex              text            , -- M or F
   birth_year       integer         ,
   overall_duration integer         ,
   overall_score    integer         ,
   organisation_id  integer         ,
   constraint pk_person primary key (id),
   foreign key(organisation_id) references organisation(id) on delete set null
)   ;

-- created upon registration unless there is a team
create table individual_registration (
   id              integer  not null,
   bib             text             ,
   person_id       integer  not null,
   individual_class_id  integer  not null,
   course_family_id     integer  not null,
   actual_course_id     integer, -- not known in case of auto detection

   constraint pk_individual_registration primary key (id),
   foreign key(individual_class_id, course_family_id) references allowed_class_course(individual_class_id, course_family_id),
   foreign key(actual_course_id) references actual_course(id),
   foreign key(person_id) references person(id) on delete cascade
)   ;

-- created for a person within a race
create table person_result (
   id              integer  not null,
   status          text     not null,
   ecard           text             ,
   start_timestamp integer         ,
   end_timestamp   integer         ,
   penalty_s      integer          ,
   score           integer          ,
   person_id       integer  not null,
   race_id       integer not null,
   constraint pk_person_result primary key (id),
   foreign key(person_id) references person(id),
   foreign key(race_id) references race(id)
)   ;

-- one line on the ticket
create table split_time (
   id              integer  not null,
   seq_num         integer  not null,
   control_code    integer  not null,
   punch_timestamp integer not null,
   status          text             ,
   person_result_id integer  not null,
   constraint pk_split_time primary key (id),
   foreign key(person_result_id) references person_result(id)
)   ;

-- N1, Women...
create table team_class (
   id         integer not null,
   short_name text    not null,
   name       text            ,
   fee        real            ,
   bib_start  integer,
   race_id         integer  not null,
   constraint pk_team_class primary key (id),
   foreign key(race_id) references race(id) on delete cascade
)   ;

-- NOSE1,... necessarily in a race (not allowing multi-races with identical teams)
create table team (
   id              integer  not null,
   race_id         integer  not null,
   bib             integer,
   name            text     not null,
   start_timestamp integer         ,
   end_timestamp   integer         ,
   penalty_s       integer          ,
   score           integer          ,
   team_class_id   integer          ,
   organisation_id integer          ,
   constraint pk_team primary key (id),
   foreign key(team_class_id) references team_class(id) ,
   foreign key(organisation_id) references organisation(id) on delete set null,
   foreign key(race_id) references race(id) on delete cascade
)   ;

-- 1st and 6th relay of N1 runs a 50', age=16-50, M|F
create table team_member_class (
   id               integer not null,
   start_order      integer not null, -- 0..n with possibly simultaneous starts eg [0,0,1,1,2,2] for pairs
   team_class_id    integer not null,
   course_family_id integer,
   allowed_sex text    not null, -- M or F or 'M|F' for both
   min_age          integer         ,
   max_age          integer         ,
   constraint pk_team_member_class primary key (id),
   foreign key(team_class_id) references team_class(id) on delete cascade,
   foreign key(course_family_id) references course_family(id) on delete set null
)   ;

-- remains attached to the team
create table team_member (
   team_id         integer not null,
   bib_subnum       integer not null,
   person_id       integer ,
   member_class_id integer,
   actual_course_id     integer         ,

   constraint pk_team_member primary key (team_id, bib_subnum),

   foreign key(member_class_id) references team_member_class(id) ,
   foreign key(team_id) references team(id) on delete cascade,
   foreign key(person_id) references person(id) on delete set null,
   foreign key(actual_course_id) references actual_course(id) on delete set null
)   ;




-- Insert fake data
INSERT INTO racing_event
(uuid, name, website)
VALUES('34c4bbc8-b355-11e6-bf9b-2b334901dd0a', 'Garagnas2016', NULL);
INSERT INTO race
(id, racing_event_uuid, name, form, start_mode)
VALUES(1, '34c4bbc8-b355-11e6-bf9b-2b334901dd0a', 'Relais', 'TEAM', 'RELAY');
INSERT INTO race
(id, racing_event_uuid, name, form, start_mode)
VALUES(2, '34c4bbc8-b355-11e6-bf9b-2b334901dd0a', 'Nuit', 'INDIVIDUAL', 'MASS');

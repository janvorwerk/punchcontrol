select
	'' || t.bib || '.' || (m.bib_subnum + 1) as bib,
	t.name as team,
	tc.short_name as short_class,
	tc.name as long_class,
	p.last_name,
	p.first_name,
	p.ecard,
	p.sex,
	p.birth_year
from
	team as t,
	team_class as tc,
	team_member as m left outer join person as p on
	m.person_id = p.id
where
	m.team_id = t.id
	and t.team_class_id = tc.id
order by
	tc.short_name,
	t.bib asc,
	m.bib_subnum asc;
	
	
select
	cf.name,
	cf.display_color,
	ac.name as variation,
	ac.length_m,
	ac.climb_m
from
	course_family cf left OUTER join actual_course ac left OUTER join individual_registration reg
on
	cf.id = ac.course_family_id
	and ac.id = reg.actual_course_id
	;


-- assign bib numbers by alphabetical order
drop table  if exists tempteams;
create TEMPORARY table tempteams as 
select
	t.id as id
from
	team as t,
	team_class as tc
where
	t.team_class_id = tc.id
	and	tc.short_name = 'mini'
order by
	t.name asc;
update team set bib = (select rowid+300 from tempteams tt where team.id = tt.id) where team.id in (select id from tempteams);
drop table tempteams;

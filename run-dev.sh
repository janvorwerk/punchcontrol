#!/bin/bash

# This is a small Gnome-bash script to start all dev commands in the sub-projects
ROOT=$(dirname $(realpath $0))
gnome-terminal --working-directory="${ROOT}" \
    --tab --working-directory="${ROOT}/shared" -e "yarn run watch" \
    --tab --working-directory="${ROOT}/server" -e "yarn run watch" \
    --tab --working-directory="${ROOT}/server" -e "yarn run start" \
    --tab --working-directory="${ROOT}/client" -e "yarn run start"

#!/bin/bash

fname=$(date -d "today" +"%Y-%m-%d")
dname=~/renderfarm.js-server/render_output/archives

#mkdir ${dname}

find ~/renderfarm.js-server/render_output/*.png -type f -mtime -1 -exec 7z a ${dname}/${fname}.7z {} \;

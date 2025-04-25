#!/bin/bash

cd dist
git init
git checkout -b gh-pages
git remote add origin https://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@github.com/nicunursekatie/taskmanager.git
git add .
git commit -m "Deploy"
git push -f origin gh-pages
cd ..
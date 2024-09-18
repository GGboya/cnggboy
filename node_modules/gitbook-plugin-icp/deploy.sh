#! /bin/bash

# npm config set registry https://registry.npmjs.org
# npm login --registry https://registry.npmjs.org
# npm publish --registry https://registry.npmjs.org

# prepare for generate docs
cd docs

# re-generate docs
rm -rf _book/ && gitbook build

# copy to docs
cp -rf _book/ .

# prepare for push 
cd ..

# add commits
git add .

# commit 
git commit -m "auto deploy website"

# push to github and others
git push origin master
# get help
default:
    just --list

# remove build data
clean:
    just sequence/clean
    just frontend/clean
    just server/clean

# clean and remove node_modules
purge:
    rm -rf ./node_modules
    just sequence/purge
    just frontend/purge
    just server/purge

# format everything
fmt:
    npx prettier --write package.json .prettierrc
    just sequence/fmt
    just frontend/fmt
    just server/fmt

# generate everything
generate:
    just frontend/generate

# execute all tests
test:
    just sequence/test
    just frontend/test
    just server/test

# build everything
build:
    just sequence/build
    just frontend/build
    just server/build

# make a sparkly build of everything
release: clean generate test build 

# run a dev server which reloads on change
server:
    npx -w server nodemon src/app.ts

rebuild:
    just sequence/build
    just frontend/build

# build a realize docker image 
image:
    docker build -t realize .

# run the latest realize image
container:
    docker run -d -p 80:80 realize
# get help
default:
    just --list

# remove build data
clean:
    just core/clean
    just frontend/clean
    just server/clean

# clean and remove node_modules
purge:
    rm -rf ./node_modules
    just core/purge
    just frontend/purge
    just server/purge

# format everything
fmt:
    npx prettier --write package.json .prettierrc
    just core/fmt
    just frontend/fmt
    just server/fmt

# generate everything
generate:
    just frontend/generate

# execute all tests
test:
    just core/test
    just frontend/test
    just server/test

# build everything
build:
    just core/build
    just frontend/build
    just server/build

# make a sparkly build of everything
release: clean generate test build 

# run the server
server:
    npx -w server nodemon src/app.ts

# build a sequence docker image 
image:
    docker build -t sequence .

# run the latest sequence image
container:
    docker run -d -p 3000:3000 sequence
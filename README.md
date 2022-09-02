# waua.org
This repo contains source code for waua.org web-site.

# Setup work environment
1. Install [Git](https://git-scm.com/downloads)
1. Install [NodeJS](https://nodejs.org/en/download/)
1. (Optional) Install [VisualStudio Code](https://code.visualstudio.com/download)
1. In command line prompt
  * `npm install -g yarn gulp`
  * `yarn install`
  
# Build
1. `npm build:dev`
1. `npm buil` (for prod)

# Debug
* `npm debug`

# VisualStudio Code support
The easiest way to develop the website is to open the folder in VSCode and start task `npm: debug`. Menu `Terminal\Run Task...`

# Code structure
Folder `app` contains all the content, like HTML templates, images and CSS styles.

EJS engine is used for templating, mostly for including other files inside HTML. For example, `<%- include('templates/head.ejs') %>` will insert the contents of the file `templates/head.ejs` in place.

SCSS is used for styles. *.scss files are generated into `generates/*.css files.

The project pattern generates standalone statis HTML site into `dist` folder. Resulting HTML images are self-suffucuent - they embed all images, generated JavaSctipt and CSS. This allows to minimize web-page load size.

Images are embeded as Base64 data-uris.

The ouptut in `prod` mode is optimized and minimized.

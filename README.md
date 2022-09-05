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
In the debug mode all the files are automatically recompiled on change and the browser page on [localhost:3000](http://localhost:3000/). So it is possible to open editor and the browser windows side by side and immediately see the effect of the changes.
* `npm debug`

# VisualStudio Code support
The easiest way to develop the website is to open the folder in VSCode and start task `npm: debug`. Menu `Terminal\Run Task...`

# Code structure
Folder `app` contains all the content, like HTML templates, images and CSS styles.

EJS engine is used for templating, mostly for including other files inside HTML. For example, `<%- include('templates/head.ejs') %>` will insert the contents of the file `templates/head.ejs` in place.

SCSS is used for styles. `*.scss` files are compiled into `generates/*.css` files. The major benefit is that it is possisible to include one file into another file.

The project pattern generates standalone statis HTML site into `dist` folder. Resulting HTML images are self-sufficient - they embed all images, generated JavaSctipt and CSS. This allows to minimize web-page load size.

Images are embeded as Base64 data-uris.

The ouptut in `prod` mode is optimized and minimized.

[Gulp](https://gulpjs.com/) is used as a build system. It allows to attach various open-source pluging, like transcompilers, minimizers etc. It is possible to call some specific task. Use `gulp --tasks` command line to discover all the  tasks, or take a look into `gulpfile.js`.

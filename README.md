# waua.org
This repo contains source code for waua.org web-site.

# Setup work environment
1. Install [Git](https://git-scm.com/downloads)
1. Install [NodeJS](https://nodejs.org/en/download/)
1. (Optional) Install [VisualStudio Code](https://code.visualstudio.com/download)
1. In command line prompt
  * ```npm install -g yarn gulp```
  * ```yarn install```

# Build
1. ```npm build:dev```
1. ```npm build``` (for prod)

# Debug
In the debug mode all the files are automatically recompiled on change and the browser page on [localhost:3000](http://localhost:3000/). So it is possible to open editor and the browser windows side by side and immediately see the effect of the changes.
* `npm debug`

# VisualStudio Code support
The easiest way to develop the website is to open the folder in VSCode and start task `npm: debug`. Menu `Terminal\Run Task...`

# Add new event
1. Add new `.ejs` file under `app/events` folder. Start file name with date and then add short name. For example `2022-08-27_Independence_Day.ejs`.
1. Add header adn footer
  ```
  <%- include('../templates/event_header.ejs') %>

  <your html content will go here>

  <%- include('../templates/event_footer.ejs') %>
  ```
3. Add html content
4. Add high-resolution rectangular and square images. Prefer `WEBP` or `PNG` format, but other formats work two.
  * the preferred width for rectangular image is `~2048` pixel.
  * the preferred width for square image is `~1024` pixel.
  * Prefer file names that start with page name. Like `2022-08-27_Independence_Day_rect.jpg` and `2022-08-27_Independence_Day_square.jpg`
5. Modify `app/events.yaml`.
  * fresh news should go the beginning of the file
  * `name` should be enquoted. If name contains other quotes, they should be escaped with `\`, like `\"`
  * `start` and `end` of the eventshould have a specific format, like `27 Aug 2022 12:00 PDT`. Don't change the format.
  * `location` should be of form `<name of the place>, <street address>, <city>, <state> <zip>`. Commas are required. Name of the place is optional.
  * `description` is used for event list. Every line will be formatted as paragraph. HTML tags are allowed.
  * JSON metadata will be automatically generated for the event.

# Code structure
Folder `app` contains all the content, like HTML templates, images and CSS styles.

EJS engine is used for templating, mostly for including other files inside HTML. For example, `<%- include('templates/head.ejs') %>` will insert the contents of the file `templates/head.ejs` in place.

SCSS is used for styles. `*.scss` files are compiled into `generates/*.css` files. The major benefit is that it is possisible to include one file into another file.

The project pattern generates standalone statis HTML site into `dist` folder. Resulting HTML images are self-sufficient - they embed all images, generated JavaSctipt and CSS. This allows to minimize web-page load size.

Images are embeded as Base64 data-uris.

The ouptut in `prod` mode is optimized and minimized.

[Gulp](https://gulpjs.com/) is used as a build system. It allows to attach various open-source pluging, like transcompilers, minimizers etc. It is possible to call some specific task. Use `gulp --tasks` command line to discover all the  tasks, or take a look into `gulpfile.js`.

# Publish to GthubPages

Project site is [waua.github.io/waua.org/](https://waua.github.io/waua.org/). To publish, build and run:
```
npm run build
gulp publishGhPages
```

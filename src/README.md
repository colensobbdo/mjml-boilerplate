# Src files

Individual emails should be placed in the `./src/templates` directory in their own folders e.g `./src/templates/my-email`.

Emails require two files: a `.mjml` and a `.json` file of the same name e.g `my-email.mjml`, `my-email.json`.

Emails are templated with [https://mozilla.github.io/nunjucks/](https://mozilla.github.io/nunjucks/) and compiled with [https://gulpjs.com/](https://gulpjs.com/).

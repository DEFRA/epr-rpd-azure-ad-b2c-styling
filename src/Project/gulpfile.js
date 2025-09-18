/// <binding BeforeBuild='build-frontend' />

let enviroments = 'local,dev,tst,pre,prd';
let enviromentList = enviroments.split(",");

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const replace = require('gulp-replace');
const path = require('path');

const storageContainerPath_local = './'
const storageContainerPath_dev = 'https://devrwddbssa1402.blob.core.windows.net/epr-registration-styling-container'
const storageContainerPath_tst = 'https://tstrwddbssa1402.blob.core.windows.net/b2c-styling-files'
const storageContainerPath_pre = 'https://prerwddbssa1402.blob.core.windows.net/epr-account-styling'
const storageContainerPath_prd = 'https://prdrwddbssa1402.blob.core.windows.net/epr-account-styling'

const deprecationSuppressions = ["import", "mixed-decls", "global-builtin"];
const paths = {
    "govuk": "node_modules/govuk-frontend/dist/govuk/"
};

let loadPaths = [
    path.join(__dirname, "node_modules"),
    path.join(__dirname, paths.govuk)
];

const sassOptions = {
    loadPaths: loadPaths,
    outputStyle: 'compressed',
    quietDeps: true,
    silenceDeprecations: deprecationSuppressions
};

enviromentList.forEach(CreateContent);

function CreateContent(environment) {

    let path = '../../' + environment;
    let storageContainerPath = eval("storageContainerPath_" + environment);

    gulp.task('compile-scss-' + environment, () => {
        return gulp.src('assets/scss/application.scss')
            .pipe(sass(sassOptions, ''))
            .pipe(gulp.dest(path, { overwrite: true }))
    })

    gulp.task('copy-fonts-' + environment, () => {
        return gulp.src('node_modules/govuk-frontend/dist/govuk/assets/fonts/*')
            .pipe(gulp.dest(path, { overwrite: true }))
    })

    gulp.task('copy-images-' + environment, () => {
        return gulp.src('node_modules/govuk-frontend/dist/govuk/assets/images/*')
            .pipe(gulp.dest(path, { overwrite: true }))
    })

    gulp.task('replace-css-paths-' + environment, () => {

        // Conditionally strip leading slash if environment is local
        const adjustedPath = (environment === 'local' && storageContainerPath.startsWith('/'))
            ? storageContainerPath.slice(1)
            : storageContainerPath;

         return gulp.src([path + '/application.css'])
             .pipe(replace('REPLACE-THIS/fonts', adjustedPath))
             .pipe(replace('REPLACE-THIS/images', adjustedPath))
             .pipe(gulp.dest(path, { overwrite: true }))
     })

     gulp.task('replace-template-paths-' + environment, () => {
         return gulp.src(['assets/templates/SignUpSignIn.html'])
             .pipe(replace('REPLACE-THIS-CSS-PATH', storageContainerPath))
             .pipe(replace('REPLACE-THIS-REBRAND-PATH', storageContainerPath))
             .pipe(gulp.dest(path, { overwrite: true }))
     })

    gulp.task('copy-rebrand-' + environment, () => {
        return gulp.src('node_modules/govuk-frontend/dist/govuk/assets/rebrand/**/*', { base: 'node_modules/govuk-frontend/dist/govuk/assets/rebrand/' })
            .pipe(gulp.dest(path + '/rebrand', { overwrite: true }));
    });

    gulp.task('build-frontend-' + environment,
        gulp.series('compile-scss-' + environment,
            'copy-fonts-' + environment,
            'copy-images-' + environment,
            'replace-css-paths-' + environment,
            'replace-template-paths-' + environment,
            'copy-rebrand-' + environment));

}

gulp.task('build-frontend', gulp.series('build-frontend-local', 'build-frontend-dev', 'build-frontend-tst', 'build-frontend-pre', 'build-frontend-prd'))
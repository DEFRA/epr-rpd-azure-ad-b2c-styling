/// <binding BeforeBuild='build-frontend' />

let enviroments = 'dev,tst,pre,prd';
let enviromentList = enviroments.split(",");

const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const replace = require('gulp-replace')
const storageContainerPath_dev = 'https://devrwddbssa1402.blob.core.windows.net/epr-registration-styling-container'
const storageContainerPath_tst = 'https://tstrwddbssa1402.blob.core.windows.net/b2c-styling-files'
const storageContainerPath_pre = 'https://prerwddbssa1402.blob.core.windows.net/epr-account-styling'
const storageContainerPath_prd = 'https://prdrwddbssa1402.blob.core.windows.net/epr-account-styling'

enviromentList.forEach(CreateContent);

function CreateContent(environment) {

    let path = '../../' + environment;
    let storageContainerPath = eval("storageContainerPath_" + environment);

    gulp.task('compile-scss-' + environment, () => {
        return gulp.src('assets/scss/application.scss')
            .pipe(sass({ outputStyle: 'compressed' }, ''))
            .pipe(gulp.dest(path, { overwrite: true }))
    })

    gulp.task('copy-fonts-' + environment, () => {
        return gulp.src('node_modules/govuk-frontend/govuk/assets/fonts/*')
            .pipe(gulp.dest(path, { overwrite: true }))
    })

    gulp.task('copy-images-' + environment, () => {
        return gulp.src('node_modules/govuk-frontend/govuk/assets/images/*')
            .pipe(gulp.dest(path, { overwrite: true }))
    })

    gulp.task('replace-css-paths-' + environment, () => {
        return gulp.src([path + '/application.css'])
            .pipe(replace('REPLACE-THIS/fonts', storageContainerPath))
            .pipe(replace('REPLACE-THIS/images', storageContainerPath))
            .pipe(gulp.dest(path, { overwrite: true }))
    })

    gulp.task('replace-template-paths-' + environment, () => {
        return gulp.src(['assets/templates/SignUpSignIn.html'])
            .pipe(replace('REPLACE-THIS-CSS-PATH', storageContainerPath))
            .pipe(gulp.dest(path, { overwrite: true }))
    })


    gulp.task('build-frontend-' + environment, gulp.series('compile-scss-' + environment, 'copy-fonts-' + environment, 'copy-images-' + environment, 'replace-css-paths-' + environment, 'replace-template-paths-' + environment))

}

gulp.task('build-frontend', gulp.series('build-frontend-dev', 'build-frontend-tst', 'build-frontend-pre', 'build-frontend-prd'))


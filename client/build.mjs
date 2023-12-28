import path from 'path';
import dotenv from 'dotenv';

import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
import {readFile} from 'fs/promises';

import ejs from 'ejs';
import glob from 'glob';
import frontMatter from 'gray-matter';
import beautify from 'js-beautify';
import {HtmlValidate} from 'html-validate';

import postcss from 'postcss';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import postcssNested from 'postcss-nested';
import psmq from 'postcss-sort-media-queries';

import chalk from 'chalk';
import utils from './utils.js';
import {minify} from 'terser';
import sharp from 'sharp';

dotenv.config({
    path: path.resolve(
        process.cwd(),
        process.env.NODE_ENV === 'development'
        ? '.env.development'
        : '.env.production'
    )
});

const pkg = JSON.parse(
    await readFile(
        new URL('./package.json', import.meta.url)
    )
);

const {
    base,
    htmlValidate
} = pkg;

const {
    SRC,
    VIEWS,
    STYLES,
    SCRIPTS,
    IMAGES,
    DIST
} = base;

const pages = glob.sync(`${VIEWS}/**/[^_]*.ejs`, {
    cwd   : SRC,
    nosort: true
});

const scripts = glob.sync(`${SCRIPTS}/*[^plugins]*/*.js`, {
    cwd   : SRC,
    nosort: true
});

const styles = glob.sync(`${STYLES}/*[^plugins|^fonts]*/*.css`, {
    cwd   : SRC,
    nosort: true
});

const images = await glob.sync(`${IMAGES}/**/**/*[^.min].{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}`, {
    cwd   : SRC,
    nosort: true
});

const reduce = (f, acc, iter) => {
    if (!iter) {
        iter = acc[Symbol.iterator]();
        acc = iter.next().value;
    }

    for (const a of iter) {
        acc = f(acc, a);
    }

    return acc;
};

const go = (...args) => reduce((a, f) => f(a), args);

let isStop = false;

const htmlValidation = ({
    srcPath,
    state = 'default',
    data
}) => {
    const htmlValidator = new HtmlValidate(htmlValidate);

    if (!srcPath) {
        return;
    }

    if (!data) {
        return;
    }

    const report = htmlValidator.validateString(data);
    const severity = ['', 'Warning', 'Error'];

    if (!report.valid) {
        console.error(chalk.red(`HTML Validation Reports: ${report.errorCount} error(s), ${report.warningCount} warning(s).`));
        console.log(chalk.yellow(`Error Path: ${srcPath}${state !== 'default' ? `.${state}` : ''}.html`));

        for (const result of report.results) {
            const lines = (result.source ?? '').split('\n');
            for (const message of result.messages) {
                const marker = message.size === 1 ? '^' : '-'.repeat(message.size);
                const messages = [
                    chalk.gray(`${message.line}:${message.column} `),
                    `${chalk.magenta(severity[message.severity])} `,
                    chalk.gray(`${message.ruleId}: ${message.message}`),
                    '\n',
                    chalk.green(lines[message.line - 1]),
                    '\n',
                    chalk.yellowBright(`${' '.repeat(message.column - 1)}${marker}`)
                ];
                console.log(messages.join(''));
            }
        }

        isStop = true;
    }

    if (report.valid) {
        isStop = false;
    }
};

const renderHTML = ({
    data,
    filePath,
    fileName
}) => {
    fs.writeFileSync(
        `${filePath}/${fileName}.html`,
        data,
        (err) => {
            if (err) {
                return console.error(err, 'html can not created!');
            }
        }
    );
};

const printProgress = (total) => {
    return (count) => {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(`${chalk.cyanBright(`compile progress: ${count} / ${total}`)}`);
    }
};

const generatorViews = () => {
    const pagesLength = pages.length;

    if (!pagesLength) {
        return;
    }

    const ejsOption = {
        root              : SRC,
        outputFunctionName: 'echo'
    };

    const startTiming = new Date();
    const print = printProgress(pagesLength);

    console.log(`${chalk.magenta('ejs to html compile start...')}`);

    for (let i = 0; i < pagesLength; i++) {
        print(i + 1);

        const pathObj = path.parse(pages[i]);
        const fileState = pathObj.name.split('.');
        const targetFile = fileState[0];
        const targetPath = path.join(__dirname, SRC, pathObj.dir, targetFile + '.ejs');
        const srcPath = path.join(pathObj.dir.replace(VIEWS, ''), targetFile);

        if (process.env.NODE_ENV === 'development') {
            process.env.BASE_PATH = path.join(__dirname, DIST);
            process.env.MINIFY = '.min';
            process.env.IMG_PATH = path.join(__dirname, DIST, IMAGES);
        }

        const pageFm = frontMatter.read(targetPath);

        if (!fs.existsSync(`${DIST}/${pathObj.dir}`)) {
            fs.mkdirSync(`${DIST}/${pathObj.dir}`, {recursive: true});
        }

        const keysState = Object.keys(pageFm.data.state);
        const statesLength = keysState.length;

        for (let j = 0; j < statesLength; j++) {
            const state = keysState[j];

            const pageProps = {
                pageFm: pageFm.data,
                state : state,
                ...utils
            };

            ejsOption.filename = targetPath;

            if (!pageFm.data) {
                return;
            }

            const render = ejs.render(pageFm.content, pageProps, ejsOption);
            const beautified = beautify.html(render, pkg.beautify);

            htmlValidation({
                srcPath: `/${VIEWS}/${srcPath}`,
                state,
                data   : beautified
            });

            renderHTML({
                data    : beautified,
                filePath: `${DIST}/${pathObj.dir}`,
                fileName: `${pathObj.name}${state !== 'default' ? `.${state}` : ''}`
            });
        }
    }

    if (!isStop) {
        console.log(`${chalk.greenBright('\nhtml compile finish.')} ${chalk.green(`(${new Date() - startTiming}ms)`)}`);
    }
};

const generatorStyles = () => {
    const stylesLength = styles.length;

    if (!stylesLength) {
        return;
    }

    const startTiming = new Date();
    const print = printProgress(stylesLength);

    console.log(`${chalk.magenta('styles compile start...')}`);

    for (let i = 0; i < stylesLength; i++) {
        print(i + 1);

        const pathObj = path.parse(styles[i]);

        if (!fs.existsSync(`${DIST}/${pathObj.dir}`)) {
            fs.mkdirSync(`${DIST}/${pathObj.dir}`, {recursive: true});
        }

        const data = fs.readFileSync(`${SRC}/${styles[i]}`);

        postcss([autoprefixer, postcssNested, cssnano, psmq])
            .process(data, {from: undefined})
            .then(result => {
                fs.writeFile(`${DIST}/${pathObj.dir}/${pathObj.name}.min.css`, result.css, (err) => {
                    if (err) {
                        return console.error(err, 'styled can not created!');
                    }
                });
            });
    }

    fs.mkdirSync(`${DIST}/${STYLES}/plugins`, {recursive: true});
    fs.cpSync(`${SRC}/${STYLES}/plugins`, `${DIST}/${STYLES}/plugins`, {recursive: true});

    fs.mkdirSync(`${DIST}/${STYLES}/fonts`, {recursive: true});
    fs.cpSync(`${SRC}/${STYLES}/fonts`, `${DIST}/${STYLES}/fonts`, {recursive: true});

    console.log(`${chalk.greenBright('\nstyles compile finish.')} ${chalk.green(`(${new Date() - startTiming}ms)`)}`);
};

const generatorScripts = async () => {
    const scriptsLength = scripts.length;

    if (!scriptsLength) {
        return;
    }

    const options = {
        compress: {
            drop_console: true,
            toplevel    : true
        }
    };

    const startTiming = new Date();
    const print = printProgress(scriptsLength);

    console.log(`${chalk.magenta('javascript compile start...')}`);

    for (let i = 0; i < scriptsLength; i++) {
        print(i + 1);

        const pathObj = path.parse(scripts[i]);

        if (!fs.existsSync(`${DIST}/${pathObj.dir}`)) {
            fs.mkdirSync(`${DIST}/${pathObj.dir}`, {recursive: true});
        }

        const data = fs.readFileSync(`${SRC}/${pathObj.dir}/${pathObj.name}.js`, 'utf-8');

        minify({
            js: data
        }, options).then(data => {
            fs.writeFileSync(`${DIST}/${pathObj.dir}/${pathObj.name}.min.js`, data.code, (err) => {
                if (err) {
                    return console.error(err, 'script can not created!');
                }
            });
        });
    }

    fs.mkdirSync(`${DIST}/${SCRIPTS}/plugins`, {recursive: true});
    fs.cpSync(`${SRC}/${SCRIPTS}/plugins`, `${DIST}/${SCRIPTS}/plugins`, {recursive: true});

    await console.log(`${chalk.greenBright('\nscripts compile finish.')} ${chalk.green(`(${new Date() - startTiming}ms)`)}`);
};

const generatorImages = async () => {
    const imagesLength = images.length;

    if (!imagesLength) {
        return;
    }

    const startTiming = new Date();

    console.log(`${chalk.magenta('images optimized start...')}`);
    const print = printProgress(imagesLength);

    for (let i = 0; i < imagesLength; i++) {
        print(i + 1);

        const types = {
            jpeg: ['jpeg', 'jpg', 'webp'],
            jpg : ['jpeg', 'jpg', 'webp'],
            png : ['png', 'avif', 'webp'],
            webp: ['webp'],
            avif: ['avif']
        };

        const pathObj = path.parse(images[i]);
        const arrayType = images[i].replace(`/${pathObj.dir}`, '').split('.');
        const imageType = arrayType[arrayType.length - 1];
        const qualityOpt = 80;

        const data = fs.readFileSync(`${SRC}/${images[i]}`);
        const buffer = await sharp(data)[types[imageType][0]]({quality: qualityOpt})
            .toBuffer();

        if (!fs.existsSync(`${DIST}/${pathObj.dir}`)) {
            fs.mkdirSync(`${DIST}/${pathObj.dir}`, {recursive: true});
        }

        types[imageType].map((type) => {
            fs.writeFileSync(`${DIST}/${pathObj.dir}/${pathObj.name}.${type}`, buffer, (err) => {
                if (err) {
                    return console.error(err, 'image can not created!');
                }
            });
        });
    }

    console.log(`${chalk.greenBright('\nimages build finish.')} ${chalk.green(`(${new Date() - startTiming}ms)`)}`);
};


if (process.env.NODE_ENV === 'image') {
    await generatorImages();
}

if (process.env.NODE_ENV !== 'image') {
    go(
        0,
        generatorViews,
        generatorStyles,
        generatorScripts,
        generatorImages
    );
}
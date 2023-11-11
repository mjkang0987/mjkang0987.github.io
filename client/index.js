const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const frontMatter = require('gray-matter');
const glob = require('glob');
const beautify = require('js-beautify');
const sassMiddleware = require('express-dart-sass');

require('dotenv').config({
    path: path.resolve(
        process.cwd(),
        process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development'
    )
});

const os = require('os');
const interfaces = os.networkInterfaces();
let localIP = 'localhost';

const pkg = require('./package.json');
const port = pkg.port[process.env.NODE_ENV] || 3000;
const base = pkg.base;

const utils = require('./utils');

const {
    SRC,
    DIST,
    VIEWS,
    STYLES,
    SCRIPTS,
    IMAGES
} = base;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const indexPath = path.join(SRC, 'index.ejs');
    const fm = frontMatter.read(indexPath);
    const {content} = fm;
    const fmGroups = new Map();

    const keys = Object.keys(fm.data.groups);
    const groupLength = keys.length;

    for (let i = 0; i < groupLength; i++) {
        fmGroups.set(keys[i], {
            group: fm.data.groups[keys[i]],
            pages: new Set()
        });
    }

    const ejsOptions = {
        root              : SRC,
        outputFunctionName: 'echo'
    };

    const indexProps = {
        pkgInfo: pkg,
        list   : fmGroups
    };

    const pages = glob.sync(`${VIEWS}/**/[^_]*.ejs`, {
        cwd   : SRC,
        nosort: true,
        nodir : true
    });

    const pagesLength = pages.length;

    for (let i = 0; i < pagesLength; i++) {
        const pathObj = path.parse(pages[i]);
        const fullPath = path.join(SRC, pages[i]);
        const srcPath = `/${pathObj.dir}/${pathObj.name}`;
        const token = srcPath.replace(/\//g, '-').slice(1);
        const pageFm = frontMatter.read(fullPath);
        const {data: fmData} = pageFm;

        const {
            group,
            state
        } = fmData;

        const keysState = Object.keys(state);
        const statesLength = keysState.length;
        const states = new Map();

        if (!keysState.includes('default')) {
            states.set('default', '기본');
        }

        for (let j = 0; j < statesLength; j++) {
            states.set(keysState[j], state[keysState[j]]);
        }

        if (!group || !indexProps.list.has(group)) {
            return;
        }

        for (const [key, value] of states) {
            const isDefault = key === 'default';
            const isUnexposedPage = value[0] === '_';

            const text = isUnexposedPage ? [...value].slice(1).join('') : value;

            const stateObj = {
                text,
                state    : key,
                token    : `${token}${!isDefault ? `-${key}` : ''}`,
                href     : `${srcPath}${!isDefault ? `.${key}` : ''}.html`,
                path     : srcPath,
                unexposed: isUnexposedPage
            };

            indexProps.list.get(group).pages.add(stateObj);
        }
    }

    res.set('Content-Type', 'text/html');
    const render = ejs.render(content, indexProps, ejsOptions);
    const beautified = beautify.html(render, pkg.beautify);
    res.end(beautified);
});

app.get(`/views/**/?*.html`, (req, res, next) => {
    const pathObj = path.parse(req.path);
    const fileState = pathObj.name.split('.');
    const targetFile = fileState[0];
    const targetPath = path.join(__dirname, SRC, pathObj.dir, targetFile + '.ejs');
    const ejsOption = {
        root              : SRC,
        outputFunctionName: 'echo'
    };

    fs.readFile(targetPath, (err, data) => {
        if (err) {
            next();
        }

        if (!err) {
            const pageFm = frontMatter(data.toString());

            const pageProps = {
                pageFm: pageFm.data,
                state : fileState[1] || 'default',
                ...utils
            };

            ejsOption.filename = targetPath;

            if (!pageFm.data) {
                return;
            }

            if (!Object.keys(pageFm.data.state).includes(pageProps.state)) {
                return console.error('have not this state!');
            }

            res.set('Content-Type', 'text/html');
            const render = ejs.render(pageFm.content, pageProps, ejsOption);
            const beautified = beautify.html(render, pkg.beautify);
            res.end(beautified);
        }
    });
});

app.use(sassMiddleware({
    src        : path.join(__dirname, SRC, STYLES),
    dest       : path.join(__dirname, SRC, STYLES),
    prefix     : '/styles',
    debug      : false,
    outputStyle: 'expanded',
    force      : true,
    maxAge     : 0
}));

app.use(`/${STYLES}`, express.static(path.join(__dirname, SRC, STYLES)));
app.use(`/${SCRIPTS}`, express.static(path.join(__dirname, SRC, SCRIPTS)));
app.use(`/${IMAGES}`, express.static(path.join(__dirname, SRC, IMAGES)));
app.use(`/`, express.static(path.join(__dirname, DIST)));
app.use('/index', express.static(path.join(__dirname, SRC, 'index')));

const keysInterface = Object.keys(interfaces);
const interfacesLength = keysInterface.length;

for (let i = 0; i < interfacesLength; i++) {
    interfaces[keysInterface[i]].filter(ip => {
        if (ip.family === 'IPv4' && ip.internal === false) {
            localIP = ip.address;
        }
    });
}

app.listen(port, _ => {
    console.log(`
(\\_(\\   ~ server started 🔥
(=' :')   http://${localIP}:${port}   
(,(')(')  http://localhost:${port}`);
});
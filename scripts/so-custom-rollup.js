'use strict';

const gulp = require('gulp-help')(require('gulp'));
const fs = require('fs');
const rollup = require('rollup').rollup;
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const path = require('path');
const config = require('../so-custom-build.conf');
const uglify = require('uglify-js')

function camelCase(str) {
  return str.replace(/-(\w)/g, (_, letter) => {
    return letter.toUpperCase();
  })
}

gulp.task('so-custom-rollup-primary-code', '', function() {
  const components = fs.readdirSync(config.paths.deployed)
    .filter(componentName => (fs.statSync(path.join(config.paths.deployed, componentName))).isDirectory());

  const globals = {
    'tslib': 'tslib',

    // Angular dependencies
    '@angular/animations': 'ng.animations',
    '@angular/animations/browser': 'ng.animations.browser',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/common/http': 'ng.common.http',
    '@angular/forms': 'ng.forms',
    '@angular/http': 'ng.http',
    '@angular/router': 'ng.router',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
    // Material entry points
    '@angular/material': 'ng.material',
    '@angular/material/core': 'ng.material.core',
    '@angular/material/input': 'ng.material.input',
    '@angular/material/button': 'ng.material.button',
    '@angular/material/sidenav': 'ng.material.sidenav',
    '@angular/material/autocomplete': 'ng.material.autocomplete',
    '@angular/material/toolbar': 'ng.material.toolbar',
    '@angular/material/dialog': 'ng.material.dialog',
    '@angular/material/icon': 'ng.material.icon',
    '@angular/material/chips': 'ng.material.chips',
    '@angular/material/slide-toggle': 'ng.material.slideToggle',
    '@angular/material/slider': 'ng.material.slider',
    '@angular/material/checkbox': 'ng.material.checkbox',
    '@angular/material/progress-bar': 'ng.material.progress-bar',
    '@angular/material/progress-spinner': 'ng.material.progress-spinner',
    '@angular/material/tooltip': 'ng.material.tooltip',
    // CDK entry points
    '@angular/cdk': 'ng.cdk',
    '@angular/cdk/overlay': 'ng.cdk.overlay',
    '@angular/cdk/portal': 'ng.cdk.portal',
    '@angular/cdk/keycodes': 'ng.cdk.keycodes',
    '@angular/cdk/bidi': 'ng.cdk.bidi',
    '@angular/cdk/coercion': 'ng.cdk.coercion',
    '@angular/cdk/scrolling': 'ng.cdk.scrolling',
    '@angular/cdk/observers': 'ng.cdk.observers',

    // Rxjs dependencies
    'rxjs/Subject': 'Rx',
    'rxjs/Subscription': 'Rx',
    'rxjs/Observable': 'Rx',
    'rxjs/BehaviorSubject': 'Rx',

    'rxjs/observable/merge': 'Rx.Observable',
    'rxjs/observable/forkJoin': 'Rx.Observable',
    'rxjs/observable/of': 'Rx.Observable',
    'rxjs/observable/timer': 'Rx.Observable',
    'rxjs/observable/fromEvent': 'Rx.Observable',

    'rxjs/operator/toPromise': 'Rx.Observable.prototype',

    'rxjs/operators/pairwise': 'Rx.Observable',
    'rxjs/operators/map': 'Rx.Observable',
    'rxjs/operators/filter': 'Rx.Observable',
    'rxjs/operators/catchError': 'Rx.Observable',
    'rxjs/operators/debounceTime': 'Rx.Observable',
    'rxjs/operators/take': 'Rx.Observable',
    'rxjs/operators/tap': 'Rx.Observable',
    'rxjs/operators/switchMap': 'Rx.Observable',
    'rxjs/operators/startWith': 'Rx.Observable',
    'rxjs/operators/skip': 'Rx.Observable',
    'rxjs/operators/takeUntil': 'Rx.Observable',

    // Covalent
    '@covalent/core': 'td.core',
    '@covalent/dynamic-forms': 'td.dynamicForms',
    '@covalent/highlight': 'td.highlight',
    '@covalent/markdown': 'td.markdown',
    '@covalent/http': 'td.http',
  };
  components.forEach(name => {
    globals[`@covalent/${name}`] = `td.${camelCase(name)}`
  });

  // Build all of them asynchronously.
  return components.reduce((previous, name) => {
    let outputPath = path.join(config.paths.deployed, name, `bundles/${name}.umd.js`);
    let outputMinPath = path.join(config.paths.deployed, name, `bundles/${name}.umd.min.js`);
    const writeOptions = {
      // Keep the moduleId empty because we don't want to force developers to a specific moduleId.
      moduleId: '',
      moduleName: `td.${camelCase(name)}`,
      format: 'umd',
      dest: outputPath,
      globals: globals,
      sourceMap: true,
    }
    const bundleOptions = {
      context: 'this',
      external: Object.keys(globals),
      entry: path.join(config.paths.deployed, name, 'index.js'),
      plugins: [nodeResolve()],
    }
    return previous
      .then(() => {
        bundleOptions.plugins.push(nodeResolve());
        const external = Object.keys(globals);
        external.splice(external.indexOf('tslib'), 1);
        bundleOptions.external = external;
        return rollup(bundleOptions);
      })
      .then((bundle) => {
        bundle.write(writeOptions).then(() => {
          const result = uglify.minify(outputPath, {
            outSourceMap: outputMinPath + '.map',
            output: {
              comments: 'some'
            }
          });
          if (result.error) {
            throw Error(result.error.DefaultsError);
          }
          fs.writeFileSync(outputMinPath, result.code);
          fs.writeFileSync(outputMinPath + '.map', result.map);
        });
      });
  }, Promise.resolve());
});

gulp.task('so-custom-rollup-secondary-code', '', function() {
  const components = fs.readdirSync(config.paths.deployedCore)
  .filter(componentName => (fs.statSync(path.join(config.paths.deployedCore, componentName))).isDirectory());

  const globals = {
    'tslib': 'tslib',

    // Angular dependencies
    '@angular/animations': 'ng.animations',
    '@angular/animations/browser': 'ng.animations.browser',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/common/http': 'ng.common.http',
    '@angular/forms': 'ng.forms',
    '@angular/http': 'ng.http',
    '@angular/router': 'ng.router',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
    // Material entry points
    '@angular/material': 'ng.material',
    '@angular/material/core': 'ng.material.core',
    '@angular/material/input': 'ng.material.input',
    '@angular/material/button': 'ng.material.button',
    '@angular/material/sidenav': 'ng.material.sidenav',
    '@angular/material/autocomplete': 'ng.material.autocomplete',
    '@angular/material/toolbar': 'ng.material.toolbar',
    '@angular/material/dialog': 'ng.material.dialog',
    '@angular/material/icon': 'ng.material.icon',
    '@angular/material/chips': 'ng.material.chips',
    '@angular/material/slide-toggle': 'ng.material.slideToggle',
    '@angular/material/slider': 'ng.material.slider',
    '@angular/material/checkbox': 'ng.material.checkbox',
    '@angular/material/progress-bar': 'ng.material.progress-bar',
    '@angular/material/progress-spinner': 'ng.material.progress-spinner',
    '@angular/material/tooltip': 'ng.material.tooltip',
    // CDK entry points
    '@angular/cdk': 'ng.cdk',
    '@angular/cdk/overlay': 'ng.cdk.overlay',
    '@angular/cdk/portal': 'ng.cdk.portal',
    '@angular/cdk/keycodes': 'ng.cdk.keycodes',
    '@angular/cdk/bidi': 'ng.cdk.bidi',
    '@angular/cdk/coercion': 'ng.cdk.coercion',
    '@angular/cdk/scrolling': 'ng.cdk.scrolling',
    '@angular/cdk/observers': 'ng.cdk.observers',

    // Rxjs dependencies
    'rxjs/Subject': 'Rx',
    'rxjs/Subscription': 'Rx',
    'rxjs/Observable': 'Rx',
    'rxjs/BehaviorSubject': 'Rx',

    'rxjs/observable/merge': 'Rx.Observable',
    'rxjs/observable/forkJoin': 'Rx.Observable',
    'rxjs/observable/of': 'Rx.Observable',
    'rxjs/observable/timer': 'Rx.Observable',
    'rxjs/observable/fromEvent': 'Rx.Observable',

    'rxjs/operator/toPromise': 'Rx.Observable.prototype',

    'rxjs/operators/pairwise': 'Rx.Observable',
    'rxjs/operators/map': 'Rx.Observable',
    'rxjs/operators/filter': 'Rx.Observable',
    'rxjs/operators/catchError': 'Rx.Observable',
    'rxjs/operators/debounceTime': 'Rx.Observable',
    'rxjs/operators/take': 'Rx.Observable',
    'rxjs/operators/tap': 'Rx.Observable',
    'rxjs/operators/switchMap': 'Rx.Observable',
    'rxjs/operators/startWith': 'Rx.Observable',
    'rxjs/operators/skip': 'Rx.Observable',
    'rxjs/operators/takeUntil': 'Rx.Observable',

    // Covalent
    '@covalent/core': 'td.core',
    '@covalent/dynamic-forms': 'td.dynamicForms',
    '@covalent/highlight': 'td.highlight',
    '@covalent/markdown': 'td.markdown',
    '@covalent/http': 'td.http',
  };
  components.forEach(name => {
    globals[`@covalent/core/${name}`] = `td.core.${camelCase(name)}`
  });

  // Build all of them asynchronously.
  return components.reduce((previous, name) => {
    let outputPath = path.join(config.paths.deployedCore, name, `bundles/${name}.umd.js`);
    let outputMinPath = path.join(config.paths.deployedCore, name, `bundles/${name}.umd.min.js`);
    const writeOptions = {
      // Keep the moduleId empty because we don't want to force developers to a specific moduleId.
      moduleId: '',
      moduleName: `td.core.${camelCase(name)}`,
      format: 'umd',
      dest: outputPath,
      globals: globals,
      sourceMap: true,
    }
    const bundleOptions = {
      context: 'this',
      external: Object.keys(globals),
      entry: path.join(config.paths.deployedCore, name, 'index.js'),
      plugins: [nodeResolve()],
    }
    return previous
      .then(() => {
        bundleOptions.plugins.push(nodeResolve());
        const external = Object.keys(globals);
        external.splice(external.indexOf('tslib'), 1);
        bundleOptions.external = external;
        return rollup(bundleOptions);
      })
      .then((bundle) => {
        bundle.write(writeOptions).then(() => {
          const result = uglify.minify(outputPath, {
            outSourceMap: outputMinPath + '.map',
            output: {
              comments: 'some'
            }
          });
          if (result.error) {
            throw Error(result.error.DefaultsError);
          }
          fs.writeFileSync(outputMinPath, result.code);
          fs.writeFileSync(outputMinPath + '.map', result.map);
        });
      });
  }, Promise.resolve());
});
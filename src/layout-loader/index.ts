import posthtml from 'posthtml';
import { imports, urls } from '@posthtml/esm';
import webpack from 'webpack';
import { LoaderContext } from '../webpack-loader-api';
import { banTextNodes } from './posthtml-plugin-ban-text-nodes';
import { loadImports } from './posthtml-plugin-load-imports';
import {
  preserveIncludesAfter,
  preserveIncludesBefore,
  validateIncludes,
} from './posthtml-plugin-panorama-includes';

export interface PostHTMLLoaderMeta {
  ast?: { type: 'posthtml'; root: posthtml.Node[] };
  messages: posthtml.Message[];
}

export default async function layoutLoader(
  this: LoaderContext,
  source: string,
  _map: never,
  meta?: PostHTMLLoaderMeta,
) {
  this.cacheable(false);

  const callback = this.async()!;

  const plugins: posthtml.Plugin[] = [
    preserveIncludesBefore,
    urls(),
    imports(),
    preserveIncludesAfter,

    loadImports(this),
    validateIncludes(this),

    banTextNodes(this),
  ];

  try {
    const input = meta?.ast?.type === 'posthtml' ? meta.ast.root : source;
    let { html } = await posthtml(plugins).process(input, {
      closingSingleTag: 'slash',
      xmlMode: true,
    });
    const table = html.split("\n")
    table.splice(1,0,"<script>\n")
    table.splice(2,0,`      
    GameUI.CustomUIConfig().uid = GameUI.CustomUIConfig().overload()
    const React = GameUI.CustomUIConfig().React
    const ReactPanorama = GameUI.CustomUIConfig().ReactPanorama
    const bundle = GameUI.CustomUIConfig().bundle
    const PanelContainer = GameUI.CustomUIConfig().PanelContainer
    if(!this['React']){
    this.React = React
    for(const key in PanelContainer){
        //@ts-ignore
        this[key] = PanelContainer[key]
    }
    for(const key in ReactPanorama){
        this[key] = ReactPanorama[key]
    }
    for(const key in React){
        this[key] = React[key]
    }
  }
  for(const key in bundle){
    this[key] = bundle[key]
  }
    \n`)
    table.splice(3,0,"</script>\n")
    html = table.join("\n")
    this._compilation.hooks.processAssets.tap(
      { name: 'layout-loader', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE },
      () => {
        for (const chunk of this._compilation.chunkGraph.getModuleChunks(this._module)) {
          for (const file of chunk.files) {
            // // @ts-expect-error Expected 2 arguments, but got 1.
            this._compilation.updateAsset(file, new webpack.sources.RawSource(html));
          }
        }
      },
    );

    callback(null, '');
  } catch (error) {
    callback((error as any));
  }
}

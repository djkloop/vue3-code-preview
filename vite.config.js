import { defineConfig } from "vite";
import { resolve } from 'path';
import vue from "@vitejs/plugin-vue";
import WindiCSS from "vite-plugin-windicss";
import vueJsx from "@vitejs/plugin-vue-jsx";

function pathResolve(dir) {
  return resolve(process.cwd(), '.', dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  runtimeCompiler: true,
  plugins: [vue(), vueJsx({}), WindiCSS()],
  resolve: {
    alias: [
      {
        find: 'vue',
        replacement: "vue/dist/vue.esm-bundler.js"
      },
      {
        find: /\/@\//,
        replacement: pathResolve('src') + '/',
      },
    ]
  }
});

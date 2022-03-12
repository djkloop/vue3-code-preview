import {
  defineComponent,
  reactive,
  toRefs,
  shallowRef,
  ref,
  computed,
  watch,
  onMounted,
  nextTick
} from "vue";
import { parse } from "@vue/compiler-sfc";
import { isEmpty, extend } from "/@/utils";
import { addStylesClient } from "/@/utils/style-loader/addStylesClient";
import { genStyleInjectionCode } from "/@/utils/style-loader/styleParser";

export default defineComponent({
  name: "CodePreview",

  setup() {
    const state = reactive({
      code_example: ``,
      sfcDescriptor: null,

      stylesUpdateHandler: null,
      hasError: false
    });
    const dynamicComponent = shallowRef({
      component: {
        template: "<div>124</div>"
      }
    });
    state.code_example = `<template>
    <div id="app">
    <!-- 动态组件 -->
        <div>11111</div>
        <div>flag -> {{  flag }}</div>
        <t-button @click="useChangeFlag"/>
    </div>
    </template>
    <script>
    export default {
    data() {
      return {
        loading: false,
        iconLoading: false,
        version: '2.x'
      };
    },
    setup() {
      let flag = ref(false);
      flag.value = true;

      onMounted(()=> {
        console.log('onMounted');
      })

      const useChangeFlag = () => {
        flag.value = !flag.value;
        useSetupPrintFlag();
      }

      const useSetupPrintFlag = () => {
        console.log(flag);
      }

      return {
        flag,
        useChangeFlag
      }
    },
    created() {
      this.enterLoading();
    },
    methods: {
      enterLoading() {
        this.loading = true;
        console.log('option created methdos', this.flag);
      }
    },
    };
    </script>
    <style>
    button {
      border: 2px solid #000;
    }
    </style>`;
    watch(
      () => state.code_example,
      () => {
        state.sfcDescriptor = parse(state.code_example.trim());
      },
      {
        immediate: true,
        deep: true
      }
    );

    state.stylesUpdateHandler = addStylesClient("demo-999", {});

    onMounted(() => {
      nextTick(() => {
        useGenComponent();
      });
    });

    const useGenComponent = async () => {
      let _genComponent = {};
      const { template, script, styles } = state.sfcDescriptor.descriptor;
      let { errors } = state.sfcDescriptor;
      if (errors && errors.length) {
        console.error(
          `Error compiling template:\n\n` + errors.map((e) => `  - ${e}`).join("\n") + "\n\n"
        );
      }

      /// template
      const templateCode = template ? template.content.trim() : ``;
      /// script
      let scriptCode = script ? script.content.trim() : ``;
      /// css
      const styleCodes = await genStyleInjectionCode(styles, "demo-999");

      // script
      if (!isEmpty(scriptCode)) {
        let componentScript = {};
        scriptCode = scriptCode.replace(/export\s+default/, "componentScript =");
        eval(scriptCode);
        // update component's content
        extend(_genComponent, componentScript);
      }

      // template
      _genComponent.template = `<section id="demo-999" class="result-box" >
            ${templateCode}
          </section>`;

      /// style
      state.stylesUpdateHandler(styleCodes);
      console.log(dynamicComponent);
      dynamicComponent.value = {
        name: "demo-999",
        component: _genComponent
      };
    };

    const useGen = (e) => {
      useCodeLint();
      state.code_example = e.target.value;
      !state.hasError && useGenComponent();
    };

    const isCodeEmpty = computed(() => {
      return !(state.code_example && !isEmpty(state.code_example.trim()));
    });

    /// code lint
    /// right -> gencode
    /// error -> return
    const useCodeLint = () => {
      // 校验代码是否为空
      state.hasError = isCodeEmpty;
      state.errorMessage = isCodeEmpty ? "代码不能为空" : null;
      // 代码为空 跳出检查
      if (isCodeEmpty) return;

      // 校验代码是否存在<template>
      const { template } = state.sfcDescriptor.descriptor;
      const templateCode = template && template.content ? template.content.trim() : ``;
      const isTemplateEmpty = isEmpty(templateCode);

      state.hasError = isTemplateEmpty;
      state.errorMessage = isTemplateEmpty ? "代码中必须包含<template>" : null;
      // 代码为空 跳出检查
      if (isTemplateEmpty) return;
    };

    return {
      ...toRefs(state),
      dynamicComponent,
      useGen
    };
  },
  render() {
    const renderComponent = this.dynamicComponent.component;
    console.log("render");

    return (
      <div class="w-full h-full flex space-x-2 px-4">
        <div class="flex f-full justify-center items-center my-4">
          <textarea
            class="border p-2 border-black"
            rows="20"
            cols="60"
            onChange={this.useGen}
            v-model={this.code_example}
          />
        </div>
        <div class="flex f-full flex-1 justify-center items-center my-4 border border-black">
          <renderComponent></renderComponent>
        </div>
      </div>
    );
  }
});

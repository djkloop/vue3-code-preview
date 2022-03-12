import 'virtual:windi.css'

import { createApp } from 'vue'
import VueCodePreview from './vue-code-preview'

/// components
import TButton from "/@/components/t-button";
import TTag from "/@/components/t-tag";

const app = createApp(VueCodePreview)

app.component(TButton.name, TButton).component(TTag.name, TTag).mount('#app')



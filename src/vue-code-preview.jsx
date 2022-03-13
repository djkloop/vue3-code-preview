import { defineComponent } from "vue";
import CodePreview from "/@/components/preview/preview";

export default defineComponent({
  name: "vue-code-preview" ,
  render() {
    return (
      <div class="flex">
        <CodePreview />
      </div>
    );
  }
});

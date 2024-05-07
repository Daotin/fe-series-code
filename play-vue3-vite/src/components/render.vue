<script lang="jsx">
import { h, ref } from "vue";
export default {
  setup() {
    const count = ref(1001);
    return () => <div>count is: {count.value}</div>;
  },
};
</script>

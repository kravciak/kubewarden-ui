import { mount } from '@vue/test-utils';

import ArrayListInteger from '@kubewarden/components/ArrayListInteger.vue';
import ArrayList from '@shell/components/form/ArrayList';
import { LabeledInput } from '@components/Form/LabeledInput';

describe('component: ArrayListInteger', () => {
  it('displays ArrayListInteger correctly and emits the correct event for data update upstream', async() => {
    const currValues = [1, 2, 3];

    const wrapper = mount(ArrayListInteger, {
      props: {
        value:      currValues,
        configType: 'container'
      },
      global: { mocks: { $store: { getters: { 'i18n/t': jest.fn() } } } },
    });

    const textInput = wrapper.findComponent(LabeledInput);
    const arrayListInput = wrapper.findComponent(ArrayList);
    const numberInput = wrapper.find('[data-testid="array-list-integer-input"]');

    expect(textInput.exists()).toBe(true);
    expect(arrayListInput.exists()).toBe(true);
    expect(numberInput.exists()).toBe(true);

    // Call the method on the component instance.
    wrapper.vm.updateRow(1, 22222);
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted()['update:value'] as Array<Array<any>>;

    expect(emitted[0][0]).toEqual([1, 22222, 3]);
  });
});

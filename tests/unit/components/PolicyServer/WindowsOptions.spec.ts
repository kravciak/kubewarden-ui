import { ExtendedVue, Vue } from 'vue/types/vue';
import { DefaultProps } from 'vue/types/options';
import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from '@jest/globals';

import WindowsOptions from '@kubewarden/components/PolicyServer/WindowsOptions.vue';
import { LabeledInput } from '@components/Form/LabeledInput';
import { Checkbox } from '@components/Form/Checkbox';

describe('component: WindowsOptions', () => {
  it('displays WindowsOptions correctly and should emit the correct event for data update upstream', async() => {
    const currValues = {
      gmsaCredentialSpec: 'some-cred-spec', gmsaCredentialSpecName: 'some-cred-spec-name', runAsUserName: 'some-stuff', hostProcess: true
    };

    const wrapper = shallowMount(WindowsOptions as unknown as ExtendedVue<Vue, {}, {}, {}, DefaultProps>, {
      propsData: { value: currValues, configType: 'pod' },
      mocks:     {
        $fetchState: { pending: false },
        $store:      { getters: { 'i18n/t': jest.fn() } }
      },
    });

    const textInput = wrapper.findComponent(LabeledInput);
    const checkboxInput = wrapper.findComponent(Checkbox);
    const gmsaCredentialSpecInput = wrapper.find('[data-testid="ps-config-security-context-pod-windowsOptions-gmsaCredentialSpec-input"]');
    const gmsaCredentialSpecNameInput = wrapper.find('[data-testid="ps-config-security-context-pod-windowsOptions-gmsaCredentialSpecName-input"]');
    const runAsUserNameInput = wrapper.find('[data-testid="ps-config-security-context-pod-windowsOptions-runAsUserName-input"]');
    const hostProcessInput = wrapper.find('[data-testid="ps-config-security-context-pod-windowsOptions-hostProcess-input"]');

    expect(textInput.exists()).toBe(true);
    expect(checkboxInput.exists()).toBe(true);
    expect(gmsaCredentialSpecInput.exists()).toBe(true);
    expect(gmsaCredentialSpecNameInput.exists()).toBe(true);
    expect(runAsUserNameInput.exists()).toBe(true);
    expect(hostProcessInput.exists()).toBe(true);

    wrapper.vm.updateData();
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()['update-windows-options']?.length).toBe(1);
    expect(wrapper.emitted()['update-windows-options']?.[0][0]).toEqual(currValues);
  });
});

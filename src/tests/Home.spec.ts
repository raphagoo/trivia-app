import { mount } from '@vue/test-utils'
import Home from '../views/CreateQuizz.vue'

describe('HelloWorld', () => {
    it('should have home class', () => {
        const wrapper = mount(Home)

        expect(wrapper.classes('home')).toBe(true)
    })
})

import { set, toggle } from '@/utils/vuex'

export default {
  setDrawer: set('drawerLeft'),
  setDrawer: set('drawerRight'),
  setImage: set('image'),
  setColor: set('color'),
  toggleDrawer: toggle('drawerLeft'),
  toggleDrawer: toggle('drawerRight')
}

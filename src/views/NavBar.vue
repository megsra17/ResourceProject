<template>
  <!-- WRAP everything in a parent container so we can have a top bar above the nav -->
  <div>
    <!-- Example Top Bar -->
    <div class="container-fluid border-bottom py-2" style="background-color: #fff">
      <div class="row align-items-center">
        <!-- Left side: Logo -->
        <div class="col-6 d-flex align-items-center">
          <a href="/">
            <img src="@/images/Nauticstar-Blue-Logo.jpg" alt="Everglades Logo" height="40" />
          </a>
        </div>

        <!-- Right side: Dealer Appeal + Add New User (if admin) -->
        <div class="col-6 text-end">
          <a
            class="fw-bold me-lg-3"
            target="_blank"
            href="https://wakeeffects.com/collections/shop-by-brand-nauticstar"
          >
            Dealer Appeal
          </a>
          <a
            v-if="authStore.isAdmin"
            class="badge rounded-pill bg-warning text-decoration-none"
            href="/add-user"
          >
            Add New User
          </a>
        </div>
      </div>
    </div>

    <!-- MAIN NAVBAR (Navy background) -->
    <nav class="navbar navbar-expand-lg ever-bg-primary">
      <div class="container-fluid">
        <!-- Mobile Toggle Button -->
        <button class="navbar-toggler text-white" type="button" @click="mobileOpen = !mobileOpen">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navbar Links: Center items using justify-content-center -->
        <div class="collapse navbar-collapse justify-content-center" :class="{ show: mobileOpen }">
          <ul class="navbar-nav text-white">
            <!-- Model Year -->
            <li class="nav-item dropdown" @mouseenter="menuOver('years')" @mouseleave="menuLeave">
              <a
                class="nav-link dropdown-toggle fs-5 text-white"
                href="#"
                role="button"
                @click.prevent="menuClick('years')"
              >
                {{ menuStore.active.year ? menuStore.active.year.year : 'Model Year' }}
              </a>
              <ul class="dropdown-menu" :class="{ show: active === 'years' }">
                <li v-for="(year, index) in menuStore.menu.years" :key="index">
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="menuStore.setFilter('year', year)"
                  >
                    {{ year.year }}
                  </a>
                </li>
              </ul>
            </li>

            <!-- Boat Model -->
            <li
              class="nav-item dropdown px-lg-4"
              @mouseenter="menuOver('boats')"
              @mouseleave="menuLeave"
            >
              <a
                class="nav-link dropdown-toggle fs-5 text-white"
                href="#"
                role="button"
                @click.prevent="menuClick('boats')"
              >
                {{ menuStore.active.boat ? menuStore.active.boat.name : 'Boat Model' }}
              </a>
              <ul class="dropdown-menu" :class="{ show: active === 'boats' }">
                <li v-for="(boat, index) in menuStore.menu.boats" :key="index">
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="menuStore.setFilter('boat', boat)"
                  >
                    {{ boat.name }}
                  </a>
                </li>
              </ul>
            </li>

            <!-- Resource Type -->
            <li
              class="nav-item dropdown pe-lg-4"
              @mouseenter="menuOver('types')"
              @mouseleave="menuLeave"
            >
              <a
                class="nav-link dropdown-toggle fs-5 text-white"
                href="#"
                role="button"
                @click.prevent="menuClick('types')"
              >
                {{ menuStore.active.type ? menuStore.active.type.name : 'Resource Type' }}
              </a>
              <ul class="dropdown-menu" :class="{ show: active === 'types' }">
                <li v-for="(type, index) in menuStore.menu.types" :key="index">
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="menuStore.setFilter('type', type)"
                  >
                    {{ type.name }}
                  </a>
                </li>
              </ul>
            </li>

            <!-- Reset Filter -->
            <li class="nav-item text-white pe-lg-4">
              <router-link class="nav-link text-white fs-5" to="/" @click="closeMenu"
                >Reset Filter</router-link
              >
            </li>

            <!-- Authentication Section -->
            <li class="nav-item" v-if="!authStore.isAuthenticated">
              <router-link class="nav-link text-white fs-5" to="/login">Login</router-link>
            </li>
            <li class="nav-item" v-else>
              <a class="nav-link text-white fs-5" href="#" @click.prevent="logout">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.navbar-toggler-icon {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255,255,255,1)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMenuStore } from '@/stores/useMenuStore' // Import Pinia store
import { useAuthStore } from '@/stores/authStore' // Import auth store

const menuStore = useMenuStore()
const authStore = useAuthStore()
const active = ref(null)
const userOpen = ref(false)
const mobileOpen = ref(false)

// Computed properties for Pinia state
const activeMenu = computed(() => active.value)

onMounted(() => {
  console.log('Menu Data:', menuStore.menu)
  console.log('Active Year:', menuStore.active.year)
})

/** Hover Methods for Navbar */
const menuOver = (menuItem) => {
  active.value = menuItem // Ensure state is updating
}

const menuLeave = () => {
  if (active.value) {
    active.value = null // Only update if active is defined
  }
}

const menuClick = (menuItem) => {
  active.value = active.value === menuItem ? null : menuItem
}

// Close menus after selecting an item
const closeMenu = () => {
  active.value = null
  mobileOpen.value = false
  userOpen.value = false
  menuStore.active = {
    // Reset active menu to default values
    year: menuStore.menu.years.length ? menuStore.menu.years[0] : { key: '', year: 'Unknown' },
    boat: menuStore.menu.boats.length ? menuStore.menu.boats[0] : { key: '', name: 'Unknown' },
    type: menuStore.menu.types.length ? menuStore.menu.types[0] : { key: '', name: 'Unknown' },
  }
}

const logout = () => {
  authStore.logout() // Use the auth store's logout method
  closeMenu()
  window.location.reload()
}

// Email contact link
const contactLink = computed(() => {
  return `mailto:amanda.aloy@evergladesboats.com?subject=${encodeURIComponent(
    'Everglades Resources Contact Request',
  )}`
})

// Define getRoute to generate route paths dynamically
const getRoute = (type, key) => {
  return `/${type}/${key}`
}
</script>

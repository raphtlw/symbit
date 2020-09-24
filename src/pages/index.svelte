<script lang="ts">
  import { Button, Dropdown, Link } from "../components";
  import { SUPPORTED_DEVICE_TYPES, navigate, remote } from "../global";
</script>

<style>
  main {
    margin: 1rem 1rem;
  }
  .about {
    display: flex;
    flex-direction: column;
    width: 90%;
    margin: auto;
  }
  /* .about h1 {
    margin-top: 0.4rem;
    font-size: 1.8rem;
    width: 100%;
    text-align: center;
  } */
  .about span {
    font-size: 0.9rem;
  }
  .about-main {
    margin-top: 0.2rem;
  }
  .about-link {
    font-size: 0.9rem;
    margin-top: 0.4rem;
  }
  .main-menu {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-top: 5rem;
  }
  .choose-device {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .choose-device h1 {
    align-self: center;
    font-size: 1rem;
    font-weight: 500;
  }
  .choose-device__dropdown {
    align-self: center;
    margin-top: 1rem;
  }
  .action {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .action h1 {
    align-self: center;
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }
  .action-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .action-item span {
    font-size: 1rem;
    font-weight: 500;
    margin-right: 2rem;
  }
</style>

<main>
  <div class="about">
    <!-- <h1>Symbit</h1> -->
    <span class="about-main">
      A root manager for Android devices which allows you to update existing
      rooted devices, tweak magisk and run other commands which improve the
      Android root experience and adds onto Magisk. 🚀
    </span>
    <div class="about-link">
      <Link href="https://github.com/raphtlw/symbit">github</Link>
    </div>
  </div>
  <div class="main-menu">
    <div class="choose-device">
      <h1>Choose your device</h1>
      <div class="choose-device__dropdown">
        <Dropdown
          value={Object.values(SUPPORTED_DEVICE_TYPES)[0]}
          items={Object.values(SUPPORTED_DEVICE_TYPES)} />
      </div>
    </div>
    <div class="action">
      <h1>What would you like to do?</h1>
      <div class="action-item">
        <span>Root a device from scratch</span>
        <Button onClick={() => navigate('root')} label="Root" />
      </div>
      <div class="action-item">
        <span>Update an existing rooted device</span>
        <Button onClick={() => navigate('update')} label="Update" />
      </div>
    </div>
  </div>
</main>

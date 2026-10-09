import {
    ButtonItem,
  PanelSection,
  PanelSectionRow,
  Tabs,
  Toggle,
  staticClasses,
} from "@decky/ui";
import {
  callable,
  definePlugin,
  // routerHook
} from "@decky/api"
import { useState, useEffect } from "react";
import { FaShip } from "react-icons/fa";

// import logo from "../assets/logo.png";
const logger = callable<[string], void>("LOGGER");

const is_gamescope_pip_active = callable<[], boolean>("is_pip_active");
const gamescopectl = callable<[parameter: string, value: string], boolean>("gamescopectl");

// const setSetting = callable<[key: string, value: any], boolean>("set_setting");
const getAllSettings = callable<[], {
        pip_enable: boolean,
        pip_aspect_ratio: string, 
        pip_inset_percent: number,
        pip_size_percent: number,
        pip_toggle: boolean,
      }>("get_all_settings");

// This function calls the python function "start_timer", which takes in no arguments and returns nothing.
// It starts a (python) timer which eventually emits the event 'timer_event'


function Content() {
  const [pipActive, setPipActive] = useState<boolean>(false);
  const [pipEnabled, setPipEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [toggling, setToggling] = useState<boolean>(false);
  const [swapped, setSwap] = useState<boolean>(false);
  const [pipToggled, setPipToggled] = useState<boolean>(false);
  const [pipInset, setPipInset] = useState<number>(25);
  const [pipSize, setPipSize] = useState<number>(20);
  const [pipAspect, setPipAspect] = useState<string>("16:9");

  useEffect(() => {
    const fetchData = async () => {
      const is_active = await is_gamescope_pip_active();
      await logger(`is_active:${is_active}`);
      setPipActive(is_active);
      loadInitialSettings();
    };
    fetchData();
  }, []);

  const loadInitialSettings = async () => {
    await logger("loading settings...");
    const settings = await getAllSettings();
    setLoading(true);
    setPipEnabled(settings.pip_enable);
    setPipToggled(settings.pip_toggle);
    setPipInset(settings.pip_inset_percent);
    setPipAspect(settings.pip_aspect_ratio);
    setPipSize(settings.pip_size_percent);

    setLoading(false);
    await logger("done loading settings...");
  };

  return (
    <PanelSection title="PiP Controls">
{      <PanelSectionRow>
       {pipEnabled && <div><div style={{
        }}>
          <span>Toggle PiP Window</span>
        </div>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
          Toggle: <Toggle
            value={pipToggled}
            onChange={async () => {
              setToggling(true);
              let toggled = await gamescopectl("pip_toggle","");
              if (toggled) {
                setPipToggled(!pipToggled);
              }
              setToggling(false);
            }}
            disabled={toggling}/>
          {pipToggled && <div style={{ color: "#ff6b6b", marginTop: "2px" }}>PiP Window Hidden</div>}
        </div></div>}
      </PanelSectionRow> }
    
{ <PanelSectionRow>
      <div style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          width: "100%",
          gap: 4,
          height: 'auto',
          maxHeight: 'none',
          overflow: 'visible'
        }}>
        <span>{pipEnabled ? "gamescopectl pip_disable" : "gamescopectl pip_enable vkgears"}</span>
      <Toggle
            value={pipEnabled}
            onChange={async () => {
              setToggling(true);
              let enabled
              if (pipEnabled) {
                enabled = await gamescopectl("pip_disable","");
              } else {
                enabled = await gamescopectl("pip_enable","vkgears");
              }
              if (enabled) {
                setPipEnabled(!pipEnabled);
              }
              setToggling(false);
            }}
            disabled={toggling}/>
          </div>
      <div style={{
          display: "flex",
          flex: 1,
          alignItems: "normal",
          width: "100%",
          gap: 4,
          height: 'auto',
          maxHeight: 'none',
          overflow: 'visible'
        }}>
        <span>{pipEnabled ? "gamescopectl pip_disable" : "gamescopectl pip_enable vkcube"}</span>
      <Toggle
            value={pipEnabled}
            onChange={async () => {
              setToggling(true);
              let enabled
              if (pipEnabled) {
                enabled = await gamescopectl("pip_disable","");
              } else {
                enabled = await gamescopectl("pip_enable","vkcube");
              }
              if (enabled) {
                setPipEnabled(!pipEnabled);
              }
              setToggling(false);
            }}
            disabled={toggling}/>
          </div>
      <div style={{
          display: "flex",
          flex: 1,
          alignItems: "normal",
          width: "100%",
          gap: 4,
          height: 'auto',
          maxHeight: 'none',
          overflow: 'visible'
        }}>
        <span>{pipEnabled ? "gamescopectl pip_disable" : "gamescopectl pip_enable vkmark"}</span>
      <Toggle
            value={pipEnabled}
            onChange={async () => {
              setToggling(true);
              let enabled
              if (pipEnabled) {
                enabled = await gamescopectl("pip_disable","");
              } else {
                enabled = await gamescopectl("pip_enable","vkmark");
              }
              if (enabled) {
                setPipEnabled(!pipEnabled);
              }
              setToggling(false);
            }}
            disabled={toggling}/>
          </div>
      </PanelSectionRow>}
    {<PanelSectionRow>
      <div style={{
        display: "flex",
        flex: 1,
        width: "100%",
        alignItems: "center",
        gap: 4,
        height: 'auto',
        maxHeight: 'none',
        overflow: 'visible'
      }}>
        <span>{swapped ? "Main Window" : "PiP Swapped"}</span>
          <Toggle
            value={swapped}
            onChange={async () => {
              setToggling(true);
              let enabled = await gamescopectl("pip_swap","");
              if (enabled) {
                setSwap(!swapped);
              }
              setToggling(false);
            }}
            disabled={toggling}/>
          </div>
        </PanelSectionRow>
  }
  {
  <PanelSectionRow>
    <ButtonItem layout="below" onClick={async () => {await gamescopectl("pip_size_percent","20")}}> Set Size Percent 20% </ButtonItem>
    <ButtonItem layout="below" onClick={async () => {await gamescopectl("pip_size_percent","30")}}> Set Size Percent 30% </ButtonItem>
    <ButtonItem layout="below" onClick={async () => {await gamescopectl("pip_size_percent","40")}}> Set Size Percent 40% </ButtonItem>
    <ButtonItem layout="below" onClick={async () => {await gamescopectl("pip_size_percent","50")}}> Set Size Percent 50% </ButtonItem>
  </PanelSectionRow> }
  {  <PanelSectionRow>
    <ButtonItem layout="below" onClick={async () => {await gamescopectl("pip_aspect_ratio","4:3")}}> Set Aspect Ratio 4:3 </ButtonItem>
    <ButtonItem layout="below" onClick={async () => {await gamescopectl("pip_aspect_ratio","16:9")}}> Set Aspect Ratio 16:9 </ButtonItem>
    <ButtonItem layout="below" onClick={async () => {await gamescopectl("pip_aspect_ratio","16:10")}}> Set Aspect Ratio 16:10 </ButtonItem>
    <ButtonItem layout="below" onClick={async () => {await gamescopectl("pip_aspect_ratio","16:16")}}> Set Aspect Ratio 16:16 </ButtonItem>
  </PanelSectionRow>
}
    </PanelSection>
  );
};

export default definePlugin(() => {
  console.log("Gamescope-Picture-in-Picture starting...")

  // serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
  //   exact: true,
  // });

  // Add an event listener to the "timer_event" event from the backend

  return {
    // The name shown in various decky menus
    name: "Gamescope-picture-in-picture",
    // The element displayed at the top of your plugin's menu
    titleView: <div className={staticClasses.Title}>Picture in Picture</div>,
    // The content of your plugin's menu
    content: <Content />,
    // The icon displayed in the plugin list
    icon: <FaShip />,
    // The function triggered when your plugin unloads
    onDismount() {
      console.log("Unloading Gamescope-PiP")
      // serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});

import os

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code repo
# and add the `decky-loader/plugin/imports` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky
import asyncio
import subprocess
from functools import wraps
from subprocess import TimeoutExpired, CalledProcessError
from settings import SettingsManager

settings = SettingsManager(name='gamescope-picture-in-picture', settings_directory=decky.DECKY_PLUGIN_SETTINGS_DIR)
settings.read()

GAMESCOPE_ENV = os.environ.copy() | {'GAMESCOPE_WAYLAND_DISPLAY':'gamescope-0', 'LD_LIBRARY_PATH': '','XDG_RUNTIME_DIR': '/run/user/1000'}
ATTRIBUTES: [set[str]] = {
    'pip_aspect_ratio', 
    'pip_disable',
    'pip_enable',
    'pip_focus_main',
    'pip_focus_pip',
    'pip_inset_percent',
    'pip_size_percent',
    'pip_swap',
    'pip_toggle'
}

GAMESCOPE_PATH = os.path.join('/', 'usr', 'bin', 'gamescope')

def subprocess_run(command: list[str], env: dict[str,str] = GAMESCOPE_ENV) -> bool:
    output = {}
    try:
        decky.logger.info(f"[BACKEND] Before: {' '.join(command)}")
        output = subprocess.run(command, text=True, capture_output=True, check=True, timeout=2, env=env) 
        decky.logger.info(f"[BACKEND] After: {' '.join(command)}: {output}")
        return not output.returncode
    except TimeoutExpired:
        decky.logger.info(f"[BACKEND] Timeout expired {' '.join(command)}")
    except CalledProcessError as e:
        decky.logger.info(f"[BACKEND] process execution error {e}")
        decky.logger.info(f"[BACKEND] error: {e.returncode} : {e.stderr}")
        decky.logger.info(e)
    except Exception as e:
        decky.logger.info(f"[BACKEND] Exception: {e}")

    decky.logger.info(f"[BACKEND] Some error happened during {''.join(command)}")
    return False
    

    
class Plugin:
    async def LOGGER(self, value: str) -> None:
        decky.logger.info(f'[FRONTEND] {value}')
        pass
    
    async def set_setting(self, key: str, value):
        decky.logger.info(f"[BACKEND] Setting {key} to {value}")
        settings.setSetting(key, value)
        success = settings.commit()
        return success

    async def get_all_settings(self):
        pip_enable = settings.getSetting("pip_enable", False)
        pip_aspect_ratio = settings.getSetting("pip_aspect_ratio", "4:3")
        pip_inset_percent = settings.getSetting("pip_inset_percent", "20")
        pip_size_percent = settings.getSetting("pip_size_percent", "20")
        pip_toggle = settings.getSetting("pip_toggle", False)
    
        return {
            "pip_enable": bool(pip_enable),
            "pip_aspect_ratio": str(pip_aspect_ratio),
            "pip_inset_percent": int(pip_inset_percent),
            "pip_size_percent": int(pip_size_percent),
            "pip_toggle": bool(pip_toggle)
        }

    ###################################
    # pip gamescopectl methods
    ###################################

    async def is_pip_active(self) -> bool:
        return self.gamescope_pip_active

    async def gamescopectl(self, parameter: str, value: str) -> bool:
        decky.logger.info("[BACKEND] gamescopectl %s %s", parameter, value)
        if parameter not in ATTRIBUTES:
            decky.logger.info("[BACKEND] %, not found", parameter)
            return False

        decky.logger.info("[BACKEND] gamescopectl %s %s", parameter, value)

        result = subprocess_run([f'gamescopectl', parameter, value])
        decky.logger.info('[BACKEND] befor if')
        if parameter == 'pip_toggle':
            decky.logger.info(f"[BACKEND]1 {parameter}: {value}")
            value = not settings.getSetting(parameter)
            decky.logger.info(f"[BACKEND]2{parameter}: {value}")
        if parameter == 'pip_disable':
            parameter = 'pip_enable'
            value = False
        if parameter == 'pip_enabled':
            value = True
        settings.setSetting(parameter, value)
        decky.logger.info(f"[BACKEND]3{parameter}: {value}")

            
        decky.logger.info("[BACKEND] gamescopectl %s %s -> %d %s", parameter, value, result)
        return result

    async def long_running(self, duration: int = 15):
        await asyncio.sleep(duration)
        # Passing through a bunch of random data, just as an example
        await decky.emit("timer_event", "Hello from the backend!", True, 2)

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info(f'LOG_LEVEL: {os.environ.get("LOG_LEVEL")}')
        decky.logger.info(f"[BACKEND] GAMESCOPE_ENV: {GAMESCOPE_ENV}")
        self.gamescope_pip_active = await self._is_gamescope_pip_active()
        # self.gamescope_pip_active = False
        decky.logger.info("[BACKEND] gamescope pip enabled")
        decky.logger.info(f"[BACKEND] active: {self.gamescope_pip_active}")
        
    # Function called first during the unload process, utilize this to handle your plugin being stopped, but not
    # completely removed
    async def _unload(self):
        decky.logger.debug("[BACKEND] nothing to unload")
        pass

    # Function called after `_unload` during uninstall, utilize this to clean up processes and other remnants of your
    # plugin that may remain on the system
    async def _uninstall(self):
        decky.logger.debug("[BACKEND] nothing to uninstall")
        pass

    async def _is_gamescope_pip_active(self) -> bool:
        return subprocess_run(['gamescopectl', 'help', '2>&1', '|', 'grep', 'pip_enable'])

    async def micro_sleep(self, duration: float = 1):
        await asyncio.sleep(.2)
        pass
    
    async def start_timer(self):
        self.loop.create_task(self.long_running())

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        decky.logger.info("Migrating")
        # Here's a migration example for logs:
        # - `~/.config/decky-template/template.log` will be migrated to `decky.decky_LOG_DIR/template.log`
        decky.migrate_logs(os.path.join(decky.DECKY_USER_HOME,
                                               ".config", "decky-template", "template.log"))
        # Here's a migration example for settings:
        # - `~/homebrew/settings/template.json` is migrated to `decky.decky_SETTINGS_DIR/template.json`
        # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky.decky_SETTINGS_DIR/`
        decky.migrate_settings(
            os.path.join(decky.DECKY_HOME, "settings", "template.json"),
            os.path.join(decky.DECKY_USER_HOME, ".config", "decky-template"))
        # Here's a migration example for runtime data:
        # - `~/homebrew/template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        decky.migrate_runtime(
            os.path.join(decky.DECKY_HOME, "template"),
            os.path.join(decky.DECKY_USER_HOME, ".local", "share", "decky-template"))

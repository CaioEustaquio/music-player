import { SongPlayerUI } from "@ui/player/SongPlayerUI";
import { PlayerController } from "./controllers/PlayerController";
import {
  createIcons,
  icons
} from "lucide";
import { SongProgressBarUI } from "@ui/player/SongProgressBarUI";
import { SongTableUI } from "@ui/player/SongTableUI";

createIcons({ icons })
const songTableUI = new SongTableUI();
const songPlayerUI = new SongPlayerUI();
const songProgressBarUI = new SongProgressBarUI();
new PlayerController(
  songTableUI,
  songPlayerUI,
  songProgressBarUI
);
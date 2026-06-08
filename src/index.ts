import { SongPlayerUI } from "@ui/player/SongPlayerUI";
import { PlayerController } from "./controllers/PlayerController";
import {
  createIcons,
  icons
} from "lucide";
import { ProgressBarUI } from "@ui/player/ProgressBarUI";
import { SongTableUI } from "@ui/player/SongTableUI";
import { VolumeBarUI } from "@ui/player/VolumeBarUI";

createIcons({ icons })
const songTableUI = new SongTableUI();
const songPlayerUI = new SongPlayerUI();
const progressBarUI = new ProgressBarUI();
const volumeBarUI = new VolumeBarUI();
new PlayerController(
  songTableUI,
  songPlayerUI,
  progressBarUI,
  volumeBarUI,
);
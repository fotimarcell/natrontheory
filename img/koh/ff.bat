@echo 720p-re kicsinyíti a %1 videót, filenév kell, .mov-ot hozzáteszi
ffmpeg -i %1.mov -vf "scale=-1:720" -c:v libx264 -crf 18 -preset medium -c:a copy %1.mp4
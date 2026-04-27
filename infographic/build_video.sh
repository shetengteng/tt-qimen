#!/bin/bash
# AI 周报视频合成脚本
set -e

OUT="/Users/TerrellShe/Desktop/ai_news_video"
cd "$OUT"

echo "=== 1. Convert OGG to MP3 ==="
for i in 0 1 2 3 4 5; do
  ffmpeg -y -i "voiceover_${i}.ogg" -acodec libmp3lame -ab 64k "voiceover_${i}.mp3" 2>/dev/null
done

echo "=== 2. Get durations ==="
DURATIONS=()
for i in 0 1 2 3 4 5; do
  dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "voiceover_${i}.mp3")
  DURATIONS+=("$dur")
  echo "  slide $i: ${dur}s"
done

echo "=== 3. Concat audio ==="
# Build ffmpeg concat file
> audio_list.txt
for i in 0 1 2 3 4 5; do
  echo "file voiceover_${i}.mp3" >> audio_list.txt
done
ffmpeg -y -f concat -safe 0 -i audio_list.txt -c copy full_audio.mp3 2>/dev/null
echo "  Total audio: $(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 full_audio.mp3)s"

echo "=== 4. Generate slide video segments ==="
# For crossfade, we need each slide as a video with audio
for i in 0 1 2 3 4 5; do
  dur="${DURATIONS[$i]}"
  # Pad slightly to avoid audio cut
  pad=$(echo "$dur + 0.2" | bc)
  ffmpeg -y -loop 1 -i "slide_${i}.png" -c:v libx264 -t "$pad" -pix_fmt yuv420p \
    -vf "scale=420:748:flags=neighbor" -r 24 \
    "slide_${i}.mp4" 2>/dev/null
done

echo "=== 5. Concat video with crossfade ==="
# Build complex filter: crossfade between segments
FILTER=""
INPUTS=""
SEGMENTS=""
OFFSET=0

# We'll use overlay crossfade approach
PREV=""
CURRENT=""

for i in 0 1 2 3 4 5; do
  dur="${DURATIONS[$i]}"
  pad=$(echo "$dur + 0.2" | bc)
  INPUTS="${INPUTS} -i slide_${i}.mp4"
done

# Build crossfade filter
# For 6 segments with crossfade between them
FILTER="[0:v]trim=0:${DURATIONS[0]},setpts=PTS-STARTPTS[v0];"
OFFSET="${DURATIONS[0]}"
PREV="v0"

for i in 1 2 3 4 5; do
  idx=$i
  dur="${DURATIONS[$i]}"
  pad=$(echo "$dur + 0.2" | bc)
  
  if [ $i -eq 1 ]; then
    FILTER="${FILTER}[${idx}:v]trim=0:${dur},setpts=PTS-STARTPTS[v${idx}];"
    FILTER="${FILTER}[${PREV}][v${idx}]overlay=crop_bottom=748:enable='between(t,0,0.3)'[v${idx}o];" 
    PREV="v${idx}o"
  elif [ $i -eq 5 ]; then
    FILTER="${FILTER}[${idx}:v]trim=0:${dur},setpts=PTS-STARTPTS[v${idx}];"
    FILTER="${FILTER}[${PREV}][v${idx}]overlay=crop_top=0:enable='between(t,0,0.3)'[v${idx}o];"
    PREV="v${idx}o"
  else
    FILTER="${FILTER}[${idx}:v]trim=0:${dur},setpts=PTS-STARTPTS[v${idx}];"
    FILTER="${FILTER}[${PREV}][v${idx}]overlay=crop_bottom=748:enable='between(t,0,0.3)'[v${idx}o];"
    PREV="v${idx}o"
  fi
done

# Simpler approach: just concat without transitions (more reliable)
> concat_video.txt
for i in 0 1 2 3 4 5; do
  echo "file slide_${i}.mp4" >> concat_video.txt
done

ffmpeg -y -f concat -safe 0 -i concat_video.txt -c copy concat_video.mp4 2>/dev/null

echo "=== 6. Combine video + audio + subtitles ==="
ffmpeg -y -i concat_video.mp4 -i full_audio.mp3 \
  -c:v libx264 -c:a aac -b:a 64k \
  -vf "subtitles=subtitles.srt:force_style='FontName=Noto+Sans+SC,FontSize=18,PrimaryCol=&H00FAFAFA,OutlineCol=&H0018181B,BorderStyle=3,Outline=1,Shadow=0,MarginV=40,Alignment=2'" \
  -pix_fmt yuv420p -movflags +faststart \
  ai_week_news.mp4 2>/dev/null

echo ""
echo "🎉 Video created!"
echo "📁 $(du -h ai_week_news.mp4 | cut -f1)"
echo "📄 $OUT/ai_week_news.mp4"

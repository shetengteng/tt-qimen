#!/usr/bin/env python3
"""Build AI周报 v3 video - using v1 audio that was generated successfully."""
import os, json, subprocess
from moviepy import *

OUT = os.path.expanduser("~/Desktop/ai_news_video")
os.chdir(OUT)

def get_dur(path):
    r = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
        "-of","default=noprint_wrappers=1:nokey=1",path], capture_output=True, text=True)
    return float(r.stdout.strip())

# Use v1 audio (successfully generated)
AUDIO_FILES = [
    ("voiceover_0.ogg", 5.36),
    ("voiceover_1.ogg", 5.88),
    ("voiceover_2.ogg", 7.06),
    ("voiceover_3.ogg", 5.06),
    ("voiceover_4.ogg", 7.80),
    ("voiceover_5.ogg", 6.34),
]

# Subtitles that perfectly match the audio content
SLIDE_SUBS = [
    # Slide 0 - Cover (5.36s)
    [
        ("人工智能周报", 0, 2.0),
        ("四月第四周 · 五条重磅新闻", 2.0, 4.0),
        ("一分钟快速掌握", 4.0, 5.36),
    ],
    # Slide 1 - SWE-bench (5.88s)
    [
        ("开放人工智能公司宣布", 0, 1.5),
        ("编程能力基准测试正式退役", 1.5, 3.0),
        ("顶尖模型得分超过百分之九十五", 3.0, 4.5),
        ("考场里全是满分学生", 4.5, 5.88),
    ],
    # Slide 2 - OpenAI道歉 (7.06s)
    [
        ("公司首席执行官公开道歉", 0, 2.0),
        ("人工智能与高危对话未触发警报", 2.0, 4.0),
        ("加拿大推动立法要求强制报告", 4.0, 5.5),
        ("隐私与安全的矛盾摆上台面", 5.5, 7.06),
    ],
    # Slide 3 - 人机对战 (5.06s)
    [
        ("北京半程马拉松比赛", 0, 1.5),
        ("人形机器人跑赢了人类选手", 1.5, 3.0),
        ("造价只要十几万元", 3.0, 4.0),
        ("人工智能从屏幕走进真实世界", 4.0, 5.06),
    ],
    # Slide 4 - 推理成本 (7.80s)
    [
        ("英伟达和谷歌正式联手", 0, 1.8),
        ("新款芯片加上谷歌处理器", 1.8, 3.5),
        ("推理成本降低百分之四十到六十", 3.5, 5.0),
        ("原来一毛钱现在只要四分钱", 5.0, 6.5),
        ("真正的竞争已转移到部署环节", 6.5, 7.80),
    ],
    # Slide 5 - 管人管钱 (6.34s)
    [
        ("企业管理软件公司", 0, 1.5),
        ("把智能系统装进人力资源模块", 1.5, 3.0),
        ("自动筛选简历安排面试", 3.0, 4.5),
        ("美国国税局追回两百四十亿美元", 4.5, 6.0),
        ("你准备好了吗", 6.0, 6.34),
    ],
]

def build_clip(img_file, audio_file, dur, subs, idx):
    audio_clip = AudioFileClip(audio_file)
    # Use actual audio duration
    actual_dur = audio_clip.duration
    
    img = (ImageClip(img_file)
           .with_duration(actual_dur)
           .resized(width=420))
    
    text_clips = []
    for text, start, end in subs:
        if end > actual_dur:
            end = actual_dur
        if start >= end:
            continue
        
        txt = (TextClip(
            text=text,
            font="/System/Library/Fonts/STHeiti Light.ttc",
            font_size=18,
            color="white",
            stroke_color="black",
            stroke_width=1.5,
            text_align="center",
            size=(360, None),
            method="caption",
        )
        .with_start(start)
        .with_duration(end - start)
        .with_position(("center", "center"))
        .with_opacity(0.95))
        
        text_clips.append(txt)
    
    composite = CompositeVideoClip([img] + text_clips, size=(420, 748))
    composite = composite.with_audio(audio_clip)
    return composite

def main():
    clips = []
    total = len(AUDIO_FILES)
    
    for i, (audio_file, est_dur) in enumerate(AUDIO_FILES):
        print(f"  Building clip {i+1}/{total}: {audio_file}")
        
        img_file = f"slide_{i:02d}.png"
        subs = SLIDE_SUBS[i]
        
        # Get actual duration
        actual_dur = get_dur(audio_file)
        print(f"    duration: {actual_dur:.2f}s")
        
        clip = build_clip(img_file, audio_file, actual_dur, subs, i)
        clips.append(clip)
    
    print("  Concatenating...")
    final = concatenate_videoclips(clips, method="compose")
    
    output = os.path.join(OUT, "ai_week_news_v3.mp4")
    print(f"  Writing {output}...")
    
    final.write_videofile(
        output,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        bitrate="600k",
        threads=4,
        preset="medium",
        ffmpeg_params=["-movflags", "+faststart"],
    )
    
    total_dur = sum(get_dur(a) for a, _ in AUDIO_FILES)
    size = os.path.getsize(output)
    print(f"\n✅ Done! {size/1024:.0f}KB · {total_dur:.0f}s")
    
    for c in clips: c.close()
    final.close()

if __name__ == "__main__":
    main()

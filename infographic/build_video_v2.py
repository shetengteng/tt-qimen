#!/usr/bin/env python3
"""Build AI周报 video with hard subtitles using MoviePy + ffmpeg."""

import os, json, math
from moviepy import *

OUT = os.path.expanduser("~/Desktop/ai_news_video")
os.chdir(OUT)

# === CONFIG ===
SLIDES = [
    {
        "img": "slide_00.png",
        "audio": "v2_0.ogg",
        "subs": [
            ("各位好，欢迎收看本期AI周报。", 0, 2.0),
            ("4月第4周 · 五条精选AI新闻", 2.0, 3.65),
        ],
    },
    {
        "img": "slide_01.png",
        "audio": "v2_1.ogg",
        "subs": [
            ("SWE-bench 正式退役", 0, 1.5),
            ("OpenAI 宣布编程基准评测退役", 1.5, 3.5),
            ("顶尖模型得分超过95%，考试已失效", 3.5, 5.5),
            ("刷题高分 ≠ 真实编程能力", 5.5, 7.46),
        ],
    },
    {
        "img": "slide_02.png",
        "audio": "v2_2.ogg",
        "subs": [
            ("Sam Altman 公开道歉", 0, 2.0),
            ("AI未预警安全威胁，加拿大推动立法", 2.0, 4.5),
            ("隐私 vs 安全：AI该不该打小报告？", 4.5, 7.54),
        ],
    },
    {
        "img": "slide_03.png",
        "audio": "v2_3.ogg",
        "subs": [
            ("人形机器人北京半马跑赢人类", 0, 1.6),
            ("造价仅十几万，腿式平衡自控", 1.6, 3.31),
            ("AI从屏幕走进真实世界", 3.31, 3.31),
        ],
    },
    {
        "img": "slide_04.png",
        "audio": "v2_4.ogg",
        "subs": [
            ("NVIDIA + Google Cloud Next 联手", 0, 2.0),
            ("Blackwell芯片 + TPU v6", 2.0, 3.5),
            ("推理成本降低 40%-60%", 3.5, 5.5),
            ("原来1毛 → 现在4分", 5.5, 7.5),
            ("竞争从训练转向部署环节", 7.5, 10.0),
            ("低成本AI决定企业客户归属", 10.0, 13.54),
        ],
    },
    {
        "img": "slide_05.png",
        "audio": "v2_5.ogg",
        "subs": [
            ("SAP用AI当面试官", 0, 2.0),
            ("筛简历、安排面试、分析情绪", 2.0, 3.5),
            ("IRS用AI查税：追回240亿美元", 3.5, 5.5),
            ("管人的、管钱的，都被AI接管", 5.5, 7.0),
            ("你准备好了吗？我们下周见", 7.0, 8.42),
        ],
    },
]

def get_audio_duration(path):
    """Get audio file duration using ffprobe."""
    import subprocess
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True
    )
    return float(r.stdout.strip())

def build_clip(slide_info, index):
    """Build a single slide video clip with hard subtitles."""
    img_path = slide_info["img"]
    audio_path = slide_info["audio"]
    sub_data = slide_info["subs"]
    
    # Get audio duration
    audio_dur = get_audio_duration(audio_path)
    
    # Add padding
    duration = audio_dur + 0.3
    
    # Create image clip
    img_clip = (ImageClip(img_path)
                .with_duration(duration)
                .resized(width=420))
    
    # Create audio clip
    audio_clip = AudioFileClip(audio_path)
    
    # Create subtitle text clips
    text_clips = []
    for text, start, end in sub_data:
        if end > audio_dur:
            end = audio_dur
        if start >= end:
            continue
        
        sub_dur = end - start
        
        txt_clip = (TextClip(
            text=text,
            font="/System/Library/Fonts/STHeiti Light.ttc",
            font_size=16,
            color="white",
            stroke_color="black",
            stroke_width=1.2,
            text_align="center",
            size=(380, None),
            method="caption",
        )
        .with_start(start)
        .with_duration(sub_dur)
        .with_position(("center", "center"))
        .with_opacity(0.95))
        
        text_clips.append(txt_clip)
    
    # Composite image + subtitles
    composite = CompositeVideoClip(
        [img_clip] + text_clips,
        size=(420, 748)
    )
    
    # Add audio
    composite = composite.with_audio(audio_clip)
    
    return composite

def main():
    clips = []
    
    for i, slide in enumerate(SLIDES):
        print(f"  Building clip {i+1}/{len(SLIDES)}: {slide['img']}")
        clip = build_clip(slide, i)
        clips.append(clip)
    
    # Concatenate all clips
    print("  Concatenating clips...")
    final = concatenate_videoclips(clips, method="compose")
    
    # Write output
    output_path = os.path.join(OUT, "ai_week_news_v2.mp4")
    print(f"  Writing final video...")
    
    final.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        bitrate="500k",
        threads=4,
        preset="medium",
        ffmpeg_params=["-movflags", "+faststart"],
    )
    
    print(f"\n✅ Done! Output: {output_path}")
    
    # Cleanup
    for clip in clips:
        clip.close()
    final.close()

if __name__ == "__main__":
    main()

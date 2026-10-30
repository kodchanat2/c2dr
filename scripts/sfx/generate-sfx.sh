#!/usr/bin/env bash
# Synthesize a small CC0-by-construction SFX kit with ffmpeg (no downloads).
# Usage: scripts/sfx/generate-sfx.sh <outDir>
set -euo pipefail

OUT="${1:?usage: generate-sfx.sh <outDir>}"
mkdir -p "$OUT"
SR=44100

gen() { # name duration filtergraph-source
  ffmpeg -v error -y -f lavfi -i "$3" -t "$2" -ar $SR -ac 2 "$OUT/$1.wav"
}

ENV_FAST="exp(-t*18)"
gen whoosh  0.7 "anoisesrc=d=0.7:c=pink:a=0.9,bandpass=f=900:w=1.2,afade=t=in:d=0.3,afade=t=out:st=0.35:d=0.35"
gen glitch  0.5 "aevalsrc='0.5*sgn(sin(2*PI*(220+800*floor(mod(t*40,4)))*t))*lt(mod(t,0.12),0.08)':d=0.5"
gen stamp   0.5 "aevalsrc='0.9*sin(2*PI*70*t)*exp(-t*12)+0.4*(random(0)-0.5)*exp(-t*40)':d=0.5"
gen drone   2.5 "aevalsrc='0.25*sin(2*PI*55*t)+0.18*sin(2*PI*82.5*t)+0.08*sin(2*PI*110.3*t)':d=2.5,afade=t=in:d=0.6,afade=t=out:st=1.8:d=0.7"
gen tick    0.15 "aevalsrc='0.6*sin(2*PI*2200*t)*$ENV_FAST*3':d=0.15"
gen rev     1.0 "aevalsrc='0.4*sin(2*PI*(80+400*t*t)*t)':d=1.0,afade=t=out:st=0.7:d=0.3"
gen draw    0.6 "anoisesrc=d=0.6:c=white:a=0.3,highpass=f=3000,tremolo=f=25:d=0.8,afade=t=out:st=0.4:d=0.2"
gen pop     0.2 "aevalsrc='0.8*sin(2*PI*(600-1800*t)*t)*exp(-t*25)':d=0.2"
gen thump   0.6 "aevalsrc='0.9*sin(2*PI*(90-60*t)*t)*exp(-t*8)':d=0.6"
gen shimmer 1.4 "aevalsrc='0.15*(sin(2*PI*1760*t)+sin(2*PI*2217*t)+sin(2*PI*2637*t))*(0.5+0.5*sin(2*PI*7*t))':d=1.4,afade=t=in:d=0.2,afade=t=out:st=0.8:d=0.6"
gen boom    2.0 "aevalsrc='0.9*sin(2*PI*(55-25*t)*t)*exp(-t*1.8)+0.3*(random(0)-0.5)*exp(-t*4)':d=2.0,lowpass=f=400"
gen water   2.0 "anoisesrc=d=2:c=brown:a=0.6,lowpass=f=700,tremolo=f=1.2:d=0.7,afade=t=in:d=0.3,afade=t=out:st=1.4:d=0.6"
gen scratch 0.5 "aevalsrc='0.6*(random(0)-0.5)*abs(sin(2*PI*6*t))':d=0.5,bandpass=f=1800:w=1.5"
gen alarm   0.9 "aevalsrc='0.35*sgn(sin(2*PI*880*t))*lt(mod(t,0.3),0.15)':d=0.9,lowpass=f=3000"
gen creak   1.2 "aevalsrc='0.3*sin(2*PI*(140+40*sin(2*PI*3*t))*t)*(random(0)*0.5+0.5)':d=1.2,bandpass=f=300:w=1,afade=t=out:st=0.8:d=0.4"
gen snap    0.8 "aevalsrc='0.9*(random(0)-0.5)*exp(-t*30)+0.5*sin(2*PI*(1200-1000*t)*t)*exp(-t*6)':d=0.8"
gen rumble  2.2 "anoisesrc=d=2.2:c=brown:a=0.7,lowpass=f=160,afade=t=in:d=0.5,afade=t=out:st=1.5:d=0.7"
gen chord   2.4 "aevalsrc='0.12*(sin(2*PI*261.6*t)+sin(2*PI*329.6*t)+sin(2*PI*392*t)+sin(2*PI*523.3*t))':d=2.4,afade=t=in:d=0.4,afade=t=out:st=1.4:d=1.0"
gen sting   2.0 "aevalsrc='0.15*(sin(2*PI*392*t)+sin(2*PI*493.9*t)+sin(2*PI*587.3*t))*exp(-t*1.5)+0.2*sin(2*PI*98*t)*exp(-t*3)':d=2.0"

echo "wrote $(ls "$OUT"/*.wav | wc -l | tr -d ' ') sfx to $OUT"

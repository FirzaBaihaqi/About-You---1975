import argparse
import re
import sys
import time
from pathlib import Path
from typing import Any, Callable


_TIMESTAMP = re.compile(r"\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]")
_OFFSET = re.compile(r"\[offset:([+-]?\d+)\]", re.IGNORECASE)

# Timeline vokal Carly Holt pada lagu The 1975 - About You (Official Video tGv7CUutzqU).
# Dimulai dari 03:01.86 pada video (dijadikan acuan 00:00.00).
# Setiap suku kata / kata disesuaikan dengan nada vokal asli (cepat, ditahan/panjang, dan jeda nafas).
ABOUT_YOU_TIMELINE: list[tuple[float, list[tuple[str, float]]]] = [
    # 03:04.60 (t = 02.74s)
    # "about youuuu" ditahan panjang, lalu langsung masuk cepat ke "that now"
    (
        2.74,
        [
            ("There was ", 0.35),
            ("something ", 0.40),
            ("about ", 0.35),
            ("yo", 0.15),
            ("u ", 0.70),       # "you" ditahan panjang
            ("that now ", 0.35), # langsung masuk cepat
            ("I can't ", 0.35),
            ("re", 0.30),
            ("mem", 0.75),       # "mem" melambat ditahan
            ("ber", 0.60),
        ],
    ),
    # 03:09.51 (t = 07.65s)
    # "thing" agak ditahan, "that made my" masuk cepat, "sur-ren-der" ("ren" nada tinggi ditahan)
    (
        7.65,
        [
            ("It's the same damn ", 0.85),
            ("thing ", 0.65),    # "thing" agak ditahan
            ("that made my ", 0.40), # langsung masuk cepat
            ("heart ", 0.45),
            ("sur", 0.25),
            ("ren", 0.85),       # "ren" nada tinggi ditahan
            ("der", 0.60),
        ],
    ),
    # 03:14.51 (t = 12.65s)
    # "on a" sangat cepat, "tra-in" ditarik panjang ("traaa-in")
    (
        12.65,
        [
            ("And I'll miss ", 0.45),
            ("you ", 0.40),
            ("on a ", 0.20),     # sangat cepat
            ("tra", 0.30),
            ("in", 0.85),        # ditarik panjang
        ],
    ),
    # 03:16.98 (t = 15.12s)
    # "in the" sangat cepat, "mor-ning" ditarik
    (
        15.12,
        [
            ("I'll miss ", 0.45),
            ("you ", 0.40),
            ("in the ", 0.20),    # sangat cepat
            ("mor", 0.70),        # ditarik
            ("ning", 0.55),
        ],
    ),
    # 03:19.50 (t = 17.64s)
    # "I never know what to" cepat, "think" aksen, "a-bout" ("bout" ditahan)
    (
        17.64,
        [
            ("I never know ", 0.55),
            ("what to ", 0.25),
            ("think ", 0.40),
            ("a", 0.20),
            ("bout", 0.85),       # ditahan
        ],
    ),
    # 03:23.63 (t = 21.77s)
    # "youuuuu" nada vokal ditarik panjang
    (
        21.77,
        [
            ("I think ", 0.45),
            ("about ", 0.45),
            ("yo", 0.20),
            ("u", 2.40),         # nada panjang "youuuuu"
        ],
    ),
    # 03:29.23 (t = 27.37s)
    (
        27.37,
        [
            ("About ", 0.50),
            ("yo", 0.20),
            ("u", 2.50),         # nada panjang "youuuuu"
        ],
    ),
    # 03:34.24 (t = 32.38s)
    # "Do you think I have forgotten", jeda nafas & drum 2.45s, lalu "about youuuu?"
    (
        32.38,
        [
            ("Do you think ", 0.60),
            ("I have ", 0.35),
            ("for", 0.30),
            ("got", 0.35),
            ("ten", 0.65),
            ("", 2.45),          # jeda instrumen / vokal nafas
            (" about ", 0.50),
            ("yo", 0.20),
            ("u?", 2.40),        # nada tinggi panjang
        ],
    ),
    # 03:44.17 (t = 42.31s)
    (
        42.31,
        [
            ("About ", 0.50),
            ("yo", 0.20),
            ("u", 2.50),
        ],
    ),
    # 03:49.30 (t = 47.44s)
    (
        47.44,
        [
            ("About ", 0.50),
            ("yo", 0.20),
            ("u", 2.50),
        ],
    ),
    # 03:54.22 (t = 52.36s)
    # "Do you think I have forgotten", jeda build-up drum, lalu klimaks "about youuuu?"
    (
        52.36,
        [
            ("Do you think ", 0.60),
            ("I have ", 0.35),
            ("for", 0.30),
            ("got", 0.35),
            ("ten", 0.65),
            ("", 2.45),          # jeda menuju puncak solo
            (" about ", 0.50),
            ("yo", 0.20),
            ("u?", 2.50),        # vokal klimaks
        ],
    ),
]


def parse_lrc(text: str) -> list[tuple[float, str]]:
    """Return sorted (seconds, lyric text) events from LRC-formatted text."""
    offset_ms = 0
    events: list[tuple[float, str]] = []

    for raw_line in text.splitlines():
        offset_match = _OFFSET.search(raw_line)
        if offset_match:
            offset_ms = int(offset_match.group(1))

        matches = list(_TIMESTAMP.finditer(raw_line))
        if not matches:
            continue

        lyric = _TIMESTAMP.sub("", raw_line).strip()
        if not lyric:
            continue

        for match in matches:
            minutes = int(match.group(1))
            seconds = int(match.group(2))
            fraction = match.group(3) or "0"
            fractional_seconds = int(fraction) / (10 ** len(fraction)) if match.group(3) else 0.0
            timestamp = minutes * 60 + seconds + fractional_seconds + offset_ms / 1000
            events.append((max(0.0, timestamp), lyric))

    events.sort(key=lambda event: event[0])
    if not events:
        raise ValueError("File LRC tidak berisi lirik bertimestamp.")
    return events


def play_timeline(
    timeline: list[tuple[float, list[tuple[str, float]]]],
    *,
    sleep: Callable[[float], None] = time.sleep,
    clock: Callable[[], float] = time.monotonic,
    emit: Callable[[str], None] | None = None,
    start_delay: float = 0.0,
    write: Callable[[str], Any] = sys.stdout.write,
    flush: Callable[[], None] = sys.stdout.flush,
) -> None:
    """Tampilkan lirik dengan ritme presisi per suku kata/kata mengikuti audio asli."""
    started_at = clock() + max(0.0, start_delay)

    for start_time, parts in timeline:
        remaining = started_at + start_time - clock()
        if remaining > 0:
            sleep(remaining)

        if emit is not None:
            emit("".join(text for text, _ in parts))
            continue

        for text, duration in parts:
            if not text:
                if duration > 0:
                    sleep(duration)
                continue

            char_delay = max(0.005, duration / len(text))
            for char in text:
                write(char)
                flush()
                sleep(char_delay)

        write("\n")
        flush()


def play_events(
    events: list[tuple[float, str]],
    *,
    sleep: Callable[[float], None] = time.sleep,
    clock: Callable[[], float] = time.monotonic,
    emit: Callable[[str], None] | None = None,
    char_delay: float | None = None,
    start_delay: float = 0.0,
    write: Callable[[str], Any] = sys.stdout.write,
    flush: Callable[[], None] = sys.stdout.flush,
) -> None:
    """Fallback: Tampilkan setiap baris lirik mengikuti timestamp LRC reguler."""
    started_at = clock() + max(0.0, start_delay)
    total_events = len(events)

    for i, (timestamp, lyric) in enumerate(events):
        remaining = started_at + timestamp - clock()
        if remaining > 0:
            sleep(remaining)

        if emit is not None:
            emit(lyric)
            continue

        if char_delay is not None:
            c_delay = max(0.0, char_delay)
        else:
            if i + 1 < total_events:
                next_timestamp = events[i + 1][0]
                available = max(0.5, next_timestamp - timestamp)
                target_duration = min(available * 0.70, len(lyric) * 0.08)
                c_delay = max(0.03, min(0.08, target_duration / len(lyric)))
            else:
                c_delay = 0.06

        for char in lyric:
            write(char)
            flush()
            if c_delay > 0:
                sleep(c_delay)
        write("\n")
        flush()


def main() -> int:
    default_lrc = Path(__file__).resolve().parent / "about_you.lrc"
    parser = argparse.ArgumentParser(
        description="Tampilkan lirik LRC di terminal dengan efek animasi ketik presisi."
    )
    parser.add_argument(
        "file",
        nargs="?",
        type=Path,
        default=default_lrc,
        help="File lirik .lrc (default: about_you.lrc dengan ritme YouTube)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.0,
        help="Jeda dalam detik sebelum lirik mulai (default: 0)",
    )
    parser.add_argument(
        "--char-delay",
        type=float,
        default=None,
        help="Jeda antar karakter dalam detik untuk mode standar",
    )
    parser.add_argument(
        "--standard-lrc",
        action="store_true",
        help="Gunakan pembacaan LRC standar alih-alih timeline presisi YouTube",
    )
    args = parser.parse_args()

    # Jika file adalah default about_you.lrc dan tidak memaksa mode standar:
    # gunakan timeline ritme presisi per kata/suku kata sesuai video YouTube resmi.
    is_about_you = (
        args.file.name.lower() == "about_you.lrc"
        and not args.standard_lrc
        and args.char_delay is None
    )

    if is_about_you:
        try:
            play_timeline(ABOUT_YOU_TIMELINE, start_delay=args.delay)
        except KeyboardInterrupt:
            sys.stdout.write("\n")
            return 130
        return 0

    try:
        events = parse_lrc(args.file.read_text(encoding="utf-8-sig"))
    except FileNotFoundError:
        print(f"File tidak ditemukan: {args.file}", file=sys.stderr)
        return 1
    except (OSError, UnicodeError, ValueError) as error:
        print(f"Tidak bisa membaca lirik: {error}", file=sys.stderr)
        return 1

    try:
        play_events(events, start_delay=args.delay, char_delay=args.char_delay)
    except KeyboardInterrupt:
        sys.stdout.write("\n")
        return 130
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

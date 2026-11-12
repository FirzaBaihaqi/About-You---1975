import unittest

from karaoke import ABOUT_YOU_TIMELINE, parse_lrc, play_events, play_timeline


class ParseLrcTests(unittest.TestCase):
    def test_parses_timestamps_and_applies_offset(self):
        events = parse_lrc("[offset:100]\n[00:01.50][00:03.00]A lyric line\n[00:02.00]Another line")
        self.assertEqual(events, [(1.6, "A lyric line"), (2.1, "Another line"), (3.1, "A lyric line")])

    def test_ignores_metadata_and_blank_lines(self):
        events = parse_lrc("[ar:Artist]\n[ti:Title]\n\n[00:00.00]First line")
        self.assertEqual(events, [(0.0, "First line")])

    def test_rejects_lrc_without_timed_lyrics(self):
        with self.assertRaises(ValueError):
            parse_lrc("[ar:Artist]\njust text")


class PlayEventsTests(unittest.TestCase):
    def test_emits_each_line_at_its_scheduled_time_without_prefix(self):
        now = [0.0]
        output = []

        def fake_sleep(seconds):
            now[0] += seconds

        events = [(1.25, "First line"), (2.0, "Second line")]
        play_events(events, sleep=fake_sleep, clock=lambda: now[0], emit=output.append)

        self.assertEqual(output, ["First line", "Second line"])
        self.assertEqual(now[0], 2.0)

    def test_typewriter_output(self):
        now = [0.0]
        chars = []

        def fake_sleep(seconds):
            now[0] += seconds

        events = [(1.0, "Hi")]
        play_events(
            events,
            sleep=fake_sleep,
            clock=lambda: now[0],
            write=chars.append,
            flush=lambda: None,
            char_delay=0.1,
        )

        self.assertEqual("".join(chars), "Hi\n")
        self.assertAlmostEqual(now[0], 1.2)


class PlayTimelineTests(unittest.TestCase):
    def test_play_timeline_emits_complete_lines(self):
        lines = []
        play_timeline(
            ABOUT_YOU_TIMELINE,
            sleep=lambda _: None,
            clock=lambda: 1000.0,
            emit=lines.append,
        )
        self.assertEqual(len(lines), 11)
        self.assertEqual(lines[0], "There was something about you that now I can't remember")
        self.assertEqual(lines[7], "Do you think I have forgotten about you?")

    def test_play_timeline_word_rhythm_execution(self):
        now = [0.0]
        chars = []

        def fake_sleep(seconds):
            now[0] += seconds

        sample_timeline = [
            (1.0, [("Go ", 0.2), ("now", 0.6)]),
        ]
        play_timeline(
            sample_timeline,
            sleep=fake_sleep,
            clock=lambda: now[0],
            write=chars.append,
            flush=lambda: None,
        )

        self.assertEqual("".join(chars), "Go now\n")
        self.assertAlmostEqual(now[0], 1.8)  # 1.0 initial wait + 0.2 + 0.6


if __name__ == "__main__":
    unittest.main()

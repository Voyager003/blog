---
title: "Building a Custom MIDI Controller"
date: 2024-11-28
tags: ["diy", "midi", "arduino", "hardware", "web-midi"]
category: "diy"
excerpt: "Step-by-step guide to creating a custom MIDI controller for live visual performances using Arduino and web technologies."
draft: false
---

# Building a Custom MIDI Controller

I've always wanted a MIDI controller specifically designed for controlling live visuals. Commercial options are either too expensive or don't have the right layout. So I built my own.

## Components

Here's what you'll need:

- Arduino Leonardo (important: has native USB MIDI support)
- 8x rotary encoders with push buttons
- 16x arcade-style buttons
- 4x 60mm faders
- Enclosure (3D printed or laser cut)

**Total cost: ~$80**

## The Build Process

### Step 1: Planning the Layout

I sketched out several layouts before settling on this arrangement:

```
[ENC] [ENC] [ENC] [ENC] | [FADER]
[ENC] [ENC] [ENC] [ENC] | [FADER]
-------------------------| [FADER]
[BTN] [BTN] [BTN] [BTN] | [FADER]
[BTN] [BTN] [BTN] [BTN] |
[BTN] [BTN] [BTN] [BTN] |
[BTN] [BTN] [BTN] [BTN] |
```

### Step 2: Wiring

All buttons are wired with internal pull-up resistors. Encoders use a matrix scanning approach to save pins.

### Step 3: Arduino Code

```cpp
#include <MIDIUSB.h>
#include <Encoder.h>

Encoder enc1(2, 3);

void loop() {
  long newPos = enc1.read();
  if (newPos != oldPos) {
    sendCC(0, map(newPos, 0, 100, 0, 127));
    oldPos = newPos;
  }
}

void sendCC(byte channel, byte value) {
  midiEventPacket_t event = {0x0B, 0xB0 | channel, 0, value};
  MidiUSB.sendMIDI(event);
  MidiUSB.flush();
}
```

## Web MIDI Integration

The best part is connecting this to web-based visuals using the Web MIDI API:

```javascript
navigator.requestMIDIAccess().then(access => {
  for (const input of access.inputs.values()) {
    input.onmidimessage = (msg) => {
      const [status, control, value] = msg.data;
      updateVisual(control, value);
    };
  }
});
```

## Results

The controller works perfectly for my live visual performances. The encoders control parameters like particle count, color hue, and motion speed. Buttons trigger different visual scenes.

## Downloads

- [3D Print Files (STL)](#)
- [Arduino Sketch](#)
- [Web MIDI Template](#)

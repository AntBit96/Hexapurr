# HEXAPURR: prompts

## The original starting prompt (verbatim)

This message was sent to OpenAI to start step 1. Every rule of the relay comes from it.

```text
Okay i have Something to generate... Lets split it in 6 steps you are OpenAI and you are starting the drawing a mysterious character, simple drawing style, we want drawing in ascii style texsture... generated from 6 different models, and you start her with step 1, i will continue and give step to to different ai, it needs to be an animal, like a cat looking like and start just simple step one, dont finish split steps into 16.6% of drawing... it needs to be image not text!
```

## The same prompt, cleaned up

The same instructions, rewritten for readability. Nothing is added or removed.

```text
We are generating something in six steps.

You are OpenAI, and you are starting the drawing: a mysterious character,
in a simple drawing style, with an ASCII-style texture. It will be built by
six different models. You do step 1. I will then hand the drawing to a
different AI for step 2, and so on.

It must be an animal that looks like a cat. Keep step 1 simple and do not
finish the drawing. Each step is about 16.6% of the work.

The output must be an image, not text.
```

## Relay template

Use this template if you want to run your own six-model relay. It follows the rules of the starting prompt. It is **not** a transcript of the messages sent during the HEXAPURR run.

```text
We are building one drawing across six different AI models, about 16.6% each.
This is step {N} of 6. You are {MODEL}. The attached image is the drawing so far.

Rules:
- Keep everything already drawn. Add to it; don't redraw it.
- Same style: a simple, mysterious, cat-like character with an ASCII-character texture.
- Add only about one sixth of the drawing. Do not finish it (unless this is step 6).
- The output must be an image, not text.
```

| Step | Model |
| :-: | --- |
| 1 | OpenAI |
| 2 | Grok |
| 3 | Claude |
| 4 | Gemini |
| 5 | Meta AI |
| 6 | NVIDIA |

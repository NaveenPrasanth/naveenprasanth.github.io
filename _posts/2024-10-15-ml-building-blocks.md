---
title: "ML Building Blocks: What Kaggle Taught Me on Day One"
date: 2024-10-15
categories:
  - machine-learning
tags:
  - kaggle
  - deep learning
  - NLP
excerpt: "I started browsing Kaggle competitions today and noticed something. Every notebook follows the same playbook."
---

### How this started

I often find myself going down rabbit holes. Today's rabbit hole was Kaggle. I started clicking through starter notebooks for NLP competitions. The kind where people predict which chatbot response a human would prefer, or classify text into categories.

After the third or fourth notebook, something clicked. They all follow the same playbook. Nobody starts from scratch. They grab a pretrained model, wire up a standard architecture, get a baseline running as fast as possible, and *then* the real work begins. Swapping loss functions, tweaking how vectors are pooled, trying different training tricks. The architecture is a template. The wins come from knowing which knobs to turn.

That got me thinking. The building blocks underneath these notebooks are worth writing down. Not as theory, but as a reference you can actually use when you're reading competition code and wondering "wait, what is a bi-encoder again?" So I'm starting a series. This is the first entry.

### Encoders: How text becomes numbers

You can't feed raw text into a neural network. You need to turn it into numbers first. An **encoder** does exactly this. It reads text and produces a vector (just a list of numbers) that captures the meaning.

```
"I love this app" → Encoder → [0.2, -0.8, 0.5, ..., 0.1]  (768 numbers)
```

This vector is called an **embedding**. Similar texts produce similar vectors. Think of it like coordinates on a map. "I love this app" and "This app is great" would end up close together, while "stock market crash" would be far away.

### Bi-Encoder: two encoders, working independently

"Bi" just means two. That's it. Two encoders running in parallel on two different inputs.

```
Text A → Encoder → Vector A
Text B → Encoder → Vector B
```

Usually it's the same model used twice, but the inputs are processed independently. Text A doesn't know about Text B during encoding. Why does this matter? Because you can pre-compute vectors for a million documents ahead of time, store them, and at search time only compute the query vector once. This is how fast search works.

### Cross-Encoder: slower but smarter

Instead of encoding separately, you feed both texts together as one input.

```
"[CLS] Text A [SEP] Text B" → Single Encoder → score
```

The model sees both texts at the same time, so it can compare them word-by-word internally. More accurate, but much slower. You can't pre-compute anything because every pair needs a fresh pass through the model.

```
Bi-Encoder:    fast,  less accurate  → good for searching millions of docs
Cross-Encoder: slow,  more accurate  → good for re-ranking top 10 results
```

In practice, many systems use both. Bi-encoder to quickly find the top 100 candidates, cross-encoder to re-rank and pick the best 10.

### Classification heads: making decisions

After the encoder gives you a vector, you need to actually *decide* something with it. The layer that makes the decision is called the **head**.

**Softmax** turns raw scores into probabilities that sum to 1. Use this when the categories are mutually exclusive. It's either spam *or* not spam, not both.

```
Raw scores:    [2.0, 1.0, 0.5]
After softmax: [0.59, 0.24, 0.17]   ← sums to 1.0
```

**Sigmoid** turns each score independently into a 0 to 1 probability. They don't need to sum to 1. Use this when multiple labels can be true at once. A photo can be "outdoor" AND "sunny" AND "beach" all at once.

An easy way to remember:

```
Softmax:  "pick one"  → this email is Inbox OR Spam OR Promotions
Sigmoid:  "pick any"  → this email gets tags: Important + Work + Urgent
```

### Loss functions: how the model learns

A loss function measures how wrong the model is. Training is just minimizing this number. There are different flavors depending on what you're trying to teach the model.

**Cross-Entropy Loss** is the standard for classification. Measures how far your predicted probabilities are from the true label. If the model says "90% class A" and it really is class A, loss is low. If the model says "10% class A" and it really is class A, loss is high. Simple.

**Contrastive Loss** teaches the model that similar things should have similar vectors and different things should have different vectors. You give it pairs and it pushes vectors closer or apart. This is how embedding models learn.

**Triplet Loss** is the same idea but with three items: an anchor, a positive, and a negative. The anchor should be closer to the positive than to the negative.

```
BEFORE training:
    Anchor -------- Positive
    Anchor ---- Negative        ← negative is closer, bad

AFTER training:
    Anchor -- Positive
    Anchor --------------- Negative   ← fixed
```

This is how face recognition works. "Is this the same person?" becomes a distance calculation.

**Ranking Loss** says given two items, the model should score the better one higher. This is what powers search ranking and the reward models in RLHF.

These form a nice progression:

```
Cross-Entropy:  "classify this into a bucket"
Contrastive:    "are these two similar or different?"
Triplet:        "which of these two is closer to this reference?"
Ranking:        "which of these should score higher?"
```

### Distance metrics: measuring similarity

When you have two vectors, how do you measure "how similar" they are?

**Euclidean distance** is the straight-line distance. Like measuring with a ruler. Smaller means more similar.

**Cosine similarity** measures the angle between vectors and ignores magnitude. This is what embedding search systems use, and for good reason. Two sentences can mean the same thing but have different lengths. Cosine doesn't care about vector length, only direction.

```
 1.0 = identical direction (same meaning)
 0.0 = perpendicular (unrelated)
-1.0 = opposite direction (opposite meaning)
```

### Training tricks

**Fine-tuning** is when you take a model that already learned language from billions of words and continue training it on your small dataset. Like hiring an experienced chef and teaching them your restaurant's menu. Much faster than training someone from scratch.

**Label smoothing** is when instead of telling the model "I'm 100% sure this is class A", you say "I'm 98% sure." Soft labels like `[0.98, 0.01, 0.01]` instead of hard labels like `[1.0, 0.0, 0.0]`. This prevents the model from becoming overconfident and keeps its predictions calibrated.

### Architectural patterns

**Siamese Network** is when the same model processes two or more inputs with shared weights. Named after Siamese twins. It's not a specific model. It's a pattern you can apply to any model.

**Pooling** is needed because transformers output one vector per token. But for classification you need one vector for the whole text. How do you collapse it?

- **[CLS] token**: BERT adds a special token at the start whose vector becomes the summary
- **Average Pooling**: average all token vectors together (most stable, very common in competition code)
- **Max Pooling**: take the max value across all tokens for each dimension (captures strongest signals)

### Putting it all together

Now here's the fun part. Remember those Kaggle notebooks I was reading? Here's what they actually look like once you know the vocabulary:

> Bi-encoder with shared weights (Siamese) processes each input separately → average pooling collapses token embeddings into one vector → concatenate the vectors → dense layer + softmax head for classification → trained with cross-entropy loss and label smoothing.

Every piece is a building block from this post. The competition is about choosing the right combination and fine-tuning it well.

I'll keep adding to this series as I work through more notebooks. Next up, I want to dig into what makes DeBERTa the go-to model for so many NLP competitions.

## TLDR:

Every Kaggle NLP notebook follows the same pattern. Pretrained encoder, pooling layer, classification head, loss function. The building blocks are:

1. **Encoders** turn text into vectors. Bi-encoders are fast (pre-compute vectors), cross-encoders are accurate (see both texts at once).
2. **Softmax** picks one class, **sigmoid** picks many.
3. **Loss functions** go from classification (cross-entropy) to comparison (contrastive, triplet, ranking).
4. **Cosine similarity** is how you measure whether two vectors mean the same thing.
5. **Fine-tuning** a pretrained model beats training from scratch. **Label smoothing** keeps it honest.

The architecture is a template. The wins come from knowing which knobs to turn.

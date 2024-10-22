# TurboThink

An experiment in integrating LLMs with UI elements.

Chat interfaces like ChatGPT require significant mental effort in formulating prompts and interpreting
the response. The hypothesis is that familiar UI elements like lists and tables can reduce the friction of usage
for many use cases.

This is a standalone client-side web application and does not submit any data to a server except
the OpenAI API.

All data is stored in your browser's local storage. If you want to be on the safe side and avoid
losing your data, workspaces and lists can be copied as JSON to the clipboard and pasted later.

## Demo

![Demo](https://github.com/espenabr/turbothink/blob/main/demo.gif)

## Get started (run locally)

```
npm install
npm run dev
```

## Some use cases

-   Brainstorming
-   Planning
-   Structuring your ideas
-   Task management / ToDo lists
-   Notetaking
-   Learning about the symbiosis of LLMs and UIs

## Features

-   AI-based grouping, sorting and filtering lists
-   Get suggestions of criterias for grouping, sorting and filtering
-   Generate lists based on other lists
-   Copy & paste lists and workspaces

## Import website content (command-line)

You can quickly grab the contents of a website and paste into TurboThink using the supplied
`website_to_clipboard/w2c.py` script. It uses [Trafilatura](https://trafilatura.readthedocs.io)
to extract the relevant content fra the URL provided.

### Install and use (with virtual environment)

```
> cd website_to_clipboard
> python -m venv ./venv
> source venv/bin/activate
> pip install -r requirements.txt
> python w2c.py <url>
```

You can now paste this as a text block into the webapp!

## Future improvements

-   More complex UI elements like nested lists and diagrams
-   Sort/filter/grouping for tables
-   Smoother user experience
-   Display errors when things go wrong

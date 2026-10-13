# Make Component (makeComponent)

`makeComponent(tag: string, bluePrint: TosiBlueprint<T>): Promise<TosiComponentSpec<T>>`
hydrates [blueprints](/blueprint-loader/) into usable [web-components](/component/).

Here are the relevant interfaces:

```
export interface PartsMap<T = Element> {
  [key: string]: T
}

export type TosiBlueprint<T = PartsMap> = (
  tag: string,
  module: TosiFactory
) => TosiComponentSpec<T> | Promise<TosiComponentSpec<T>>

export interface TosiComponentSpec<T = PartsMap> {
  type: Component<T>
  lightStyleSpec?: TosiStyleSheet
  styleSpec?: TosiStyleSheet // deprecated, use lightStyleSpec
}
```

Note that a crucial benefit of blueprints is that the **consumer** of the blueprint gets
to choose the `tagName` of the custom-element.

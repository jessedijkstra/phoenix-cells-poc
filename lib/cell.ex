defmodule Phoenix.Cell do
  defmacro __using__(_opts) do
    quote do
      use Phoenix.View, root: "web/cells", namespace: unquote(__MODULE__)

      import Phoenix.Cell.Helpers

      def params(values) do
        Poison.encode!(values)
      end

      def name do
        __MODULE__
        |> Atom.to_string
        |> String.split(".")
        |> List.last
      end

      def class(class_name) do
        name <> "__" <> class_name
      end

      defoverridable [params: 1, name: 0, class: 1]
    end
  end

  def render_cell(cell, assigns) do
    Phoenix.View.render(
      cell,
      "template.html",
      assigns
    )
  end
end

defmodule Phoenix.Cell.Helpers do
  def cell(cell) do
    Phoenix.Cell.render_cell(cell, %{})
  end

  def cell(cell, %{} = assigns) do
    Phoenix.Cell.render_cell(cell, assigns)
  end

  def cell(cell, [do: children]) do
    Phoenix.Cell.render_cell(cell, children: children)
  end

  def cell(cell, %{} = assigns, [do: children]) do
    Phoenix.Cell.render_cell(cell, Map.put(assigns, :children, children))
  end
end

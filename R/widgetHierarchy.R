#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
widgetHierarchy <- function(data,
                            width = NULL, 
                            height = NULL,
                            boxHeight = 60,
                            boxWidth = 130,
                            tx = 0, ty = 0,
                            angle = 0,
                            scale = 1,
                            linkType = c("elbow", "diagonal", "ortho"),
                            treeOrientation = c("horizontal", "vertical"),
                            zoom = FALSE) {
    
    # validate input
    if (!is.data.frame(data)) {
        stop("data must be a data.frame where a row is a node with attributes.")
    }
    root <- jsonlite::toJSON( data, dataframe = c("rows") )

    # create options
    options = list(
        height = height,
        width = width,
        boxHeight = boxHeight,
        boxWidth = boxWidth,
        tx = tx, ty = ty,
        angle = angle,
        scale = scale,
        linkType = linkType,
        treeOrientation = treeOrientation,
        zoom = zoom
    )
    
    # create widget
    htmlwidgets::createWidget(
        name = 'widgetHierarchy',
        x = list(root = root, options = options),
        width = width,
        height = height,
#       htmlwidgets::sizingPolicy(padding = 10, browser.fill = TRUE),
        package = 'widgetHierarchy'
    )
}
#   # forward options using x
#   x = list(
#     message = message
#   )
# 
#   # create widget
#   htmlwidgets::createWidget(
#     name = 'widgetHierarchy',
#     x,
#     width = width,
#     height = height,
#     package = 'widgetHierarchy'
#   )
# }

#' Widget output function for use in Shiny
#'
#' @export
widgetHierarchyOutput <- function(outputId, width = '100%', height = '100%'){
  htmlwidgets::shinyWidgetOutput(outputId, 'widgetHierarchy', width, height, package = 'widgetHierarchy')
}

#' Widget render function for use in Shiny
#'
#' @export
renderWidgetHierarchy <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
    htmlwidgets::shinyRenderWidget(expr, widgetHierarchyOutput, env, quoted = TRUE)
}

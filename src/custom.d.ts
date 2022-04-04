// this seems like a very tacky way to go about this imo (using svgs as React components)
declare module "*.svg" {
    import React = require('react');
    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    const content: any;
    export default content;
}

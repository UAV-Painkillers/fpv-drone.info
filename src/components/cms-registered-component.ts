import type { Component } from "@builder.io/qwik";

export interface CMSRegisteredComponent {
    component: Component<any>;
    name: string;
}
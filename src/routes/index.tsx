import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useRedirectToLang = routeLoader$(({redirect}) => {
    redirect(302, '/en');
});

export default component$(() => {
    useRedirectToLang();
    return <div>Index.tsx</div>
});

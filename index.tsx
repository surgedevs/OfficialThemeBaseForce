/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/Settings";
import { ErrorBoundary } from "@components/index";
import { Devs } from "@utils/constants";
import { Margins } from "@utils/margins";
import definePlugin, { OptionType } from "@utils/types";
import { findComponentByCodeLazy } from "@webpack";
import { useState } from "@webpack/common";

const DiscordRadioGroup = findComponentByCodeLazy("radioItemClassName", "MEDIUM,radioPosition");

const settings = definePluginSettings({
    currentOption: {
        type: OptionType.STRING,
        hidden: true,
        description: "",
        default: "leave"
    }
});

function Selectors() {
    const [value, setValue] = useState(settings.store.currentOption);

    const onSelectOption = newValue => {
        setValue(newValue.value);
        settings.store.currentOption = newValue.value;
    };

    return <DiscordRadioGroup
        className={Margins.top20}
        options={[
            {
                name: "Leave As Is",
                value: "leave"
            },
            {
                name: "Force Dark",
                value: "dark"
            },
            {
                name: "Force Light",
                value: "light"
            }
        ]}
        value={value}
        onChange={onSelectOption}
    />;
}

export default definePlugin({
    name: "OfficialThemeBaseForce",
    description: "Allows you to force official Discord themes to use the opposite theme base. I.e. Make light theme dark and vice versa.",
    authors: [Devs.surgedevs],
    settings: settings,
    patches: [
        {
            find: "systemSelectorFirst",
            replacement: {
                match: /(}\))(]}\)},\i=\i=>{let{systemSelectorFirst)/,
                replace: "$1,$self.selectors()$2"
            }
        },
        {
            find: "mobileThemesIndex",
            replacement: {
                match: /(\i)=(\i\.\i\[\i\])/,
                replace: "$1=$2;$self.setTheme($1)"
            }
        }
    ],
    setTheme(theme: any) {
        const { currentOption } = settings.store;
        if (currentOption === "leave") return;

        theme.theme = currentOption;
    },
    selectors: ErrorBoundary.wrap(Selectors)
});

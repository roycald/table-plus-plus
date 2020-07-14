import {PanelPlugin} from '@grafana/data';
import {SimplePanel} from './SimplePanel';

export const plugin = new PanelPlugin(SimplePanel).setPanelOptions((builder) => {
  return builder;
})
    .useFieldConfig({
      useCustomConfig: (builder) => {
        builder.addBooleanSwitch({
          path: 'editable',
          name: 'editable',
          description: 'allow editing cells in column',
        }).addTextInput({
          path: 'update_api',
          name: 'update_url',
          description: 'path to the api the table will update on cell change.',
        }).addTextInput({
          path: 'value_enums',
          name: 'value_enums',
          description: 'enums of available values to choose from.',
        });
      },
});

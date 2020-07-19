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
          name: 'update_api',
          description: 'path to the api the table will update on cell change.',
        }).addTextInput({
          path: 'id_field',
          name: 'id_field',
          description: 'The field that will serve as the id for the api call.',
        }).addTextInput({
          path: 'value_field',
          name: 'value_field',
          description: 'The field that will serve as the value for the api call.',
        }).addTextInput({
          path: 'value_enums',
          name: 'value_enums',
          description: 'enums of available values to choose from.',
        });
      },
});

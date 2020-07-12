import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions(builder => {
  return builder
}).useFieldConfig({
  useCustomConfig: builder => {
    builder.addBooleanSwitch({
      path: 'editable',
      name: 'editable',
      description: 'allow editing cells in column',
    }).addTextInput({
      path: 'update_api',
      name: 'update_url',
      description: 'path to the api the table will update on cell change.',
    })
  }
});

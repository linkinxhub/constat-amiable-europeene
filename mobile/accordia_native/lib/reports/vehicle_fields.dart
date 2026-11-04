import 'package:flutter/material.dart';

import 'copy.dart';
import 'model.dart';

/// Uses values exported from the web form. Suggestions never prefill facts.
class NativeVehicleFields extends StatelessWidget {
  const NativeVehicleFields({
    super.key,
    required this.vehicle,
    required this.side,
    required this.copy,
    required this.onChanged,
    this.requireCore = true,
  });
  final Map<String, dynamic> vehicle;
  final int side;
  final ReportCopy copy;
  final VoidCallback onChanged;
  final bool requireCore;
  @override
  Widget build(BuildContext context) {
    final spec = copy.data['formParity'] as Map;
    final lang = copy.language.name;
    final simple = spec['simpleCopy'][lang] as Map;
    final extra = (vehicle['extra'] ??= <String, dynamic>{}) as Map;
    Widget field(Map map, String key, {bool required = false}) {
      final options =
          ((spec['presets'][lang][vehicle['kind'] ?? 'car'] as Map? ?? {})[key]
              as List? ??
          []);
      return NativeReportField(
        key: ValueKey('$side-$key'),
        value: map[key]?.toString() ?? '',
        label: map == extra
            ? copy.extra(key)
            : ['model', 'plate'].contains(key) && vehicle['kind'] != null
            ? copy.data['vehicleKindCopy'][lang][key] as String
            : copy.text(key),
        required: required,
        requiredMessage: copy.text('required'),
        date: (spec['dateFields'] as List).contains(key),
        options: options,
        chooseLabel: simple['choose'] as String,
        keyboard: key == 'email'
            ? TextInputType.emailAddress
            : key.toLowerCase().contains('phone')
            ? TextInputType.phone
            : TextInputType.text,
        lines:
            [
              'damage',
              'observations',
              'address',
              'policyholderAddress',
              'agencyAddress',
            ].contains(key)
            ? 3
            : 1,
        onChanged: (value) {
          map[key] = value;
          onChanged();
        },
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          '${copy.text('vehicle')} ${side == 0 ? 'A' : 'B'}',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          key: ValueKey('kind-$side'),
          initialValue: vehicleKinds.contains(vehicle['kind'])
              ? vehicle['kind'] as String
              : null,
          isExpanded: true,
          decoration: InputDecoration(
            labelText: copy.data['vehicleKindCopy'][lang]['title'] as String,
            border: const OutlineInputBorder(),
          ),
          items: [
            for (final kind in vehicleKinds)
              DropdownMenuItem(value: kind, child: Text(copy.kinds[kind]!)),
          ],
          onChanged: (value) {
            vehicle['kind'] = value;
            onChanged();
          },
          validator: (value) =>
              requireCore && value == null ? copy.text('required') : null,
        ),
        const SizedBox(height: 14),
        Text(copy.text('distinction')),
        const SizedBox(height: 14),
        for (final key in (spec['fields'] as List).cast<String>())
          field(
            vehicle,
            key,
            required:
                requireCore &&
                [
                  'driver',
                  'policyholder',
                  'plate',
                  'model',
                  'insurer',
                  'policy',
                ].contains(key),
          ),
        ExpansionTile(
          title: Text(spec['suggestionsCopy'][lang]['title'] as String),
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(spec['suggestionsCopy'][lang]['hint'] as String),
            ),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final suggestion
                    in (spec['damageSuggestions'][lang] as List).cast<String>())
                  OutlinedButton(
                    onPressed:
                        appendNativeDamage(
                              vehicle['damage'] as String,
                              suggestion,
                            ) ==
                            vehicle['damage']
                        ? null
                        : () {
                            vehicle['damage'] = appendNativeDamage(
                              vehicle['damage'] as String,
                              suggestion,
                            );
                            onChanged();
                          },
                    child: Text(suggestion),
                  ),
              ],
            ),
          ],
        ),
        if (hasTrailer(vehicle) ||
            (extra['trailerPlate']?.toString().isNotEmpty ?? false) ||
            (extra['trailerCountry']?.toString().isNotEmpty ?? false)) ...[
          field(
            extra,
            'trailerPlate',
            required: hasTrailer(vehicle) && requireCore,
          ),
          field(extra, 'trailerCountry'),
          if (!hasTrailer(vehicle)) Text(copy.n('trailerConflict')),
        ],
        for (
          var group = 0;
          group < (spec['detailGroups'] as List).length;
          group++
        )
          ExpansionTile(
            key: ValueKey('details-$side-$group'),
            maintainState: true,
            title: Text((simple['groups'] as List)[group] as String),
            children: [
              for (final key
                  in (spec['detailGroups'][group] as List).cast<String>())
                if (!['trailerPlate', 'trailerCountry'].contains(key))
                  field(extra, key),
            ],
          ),
        const Divider(height: 32),
      ],
    );
  }
}

/// Controlled native input: switching a suggestion or date keeps arbitrary text.
class NativeReportField extends StatefulWidget {
  const NativeReportField({
    super.key,
    required this.value,
    required this.label,
    required this.onChanged,
    this.required = false,
    this.requiredMessage = '',
    this.date = false,
    this.options = const [],
    this.chooseLabel = '',
    this.lines = 1,
    this.keyboard = TextInputType.text,
  });
  final String value, label, requiredMessage, chooseLabel;
  final ValueChanged<String> onChanged;
  final bool required, date;
  final List options;
  final int lines;
  final TextInputType keyboard;
  @override
  State<NativeReportField> createState() => _NativeReportFieldState();
}

class _NativeReportFieldState extends State<NativeReportField> {
  late final TextEditingController controller;
  @override
  void initState() {
    super.initState();
    controller = TextEditingController(text: widget.value);
  }

  @override
  void didUpdateWidget(covariant NativeReportField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (controller.text != widget.value)
      controller.value = TextEditingValue(
        text: widget.value,
        selection: TextSelection.collapsed(offset: widget.value.length),
      );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void choose(String value) {
    controller.text = value;
    widget.onChanged(value);
  }

  Future<void> date() async {
    final initial = DateTime.tryParse(controller.text) ?? DateTime.now();
    final value = await showDatePicker(
      context: context,
      initialDate:
          initial.isBefore(DateTime(1900)) || initial.isAfter(DateTime(2200))
          ? DateTime.now()
          : initial,
      firstDate: DateTime(1900),
      lastDate: DateTime(2200),
    );
    if (value != null && mounted)
      choose(
        '${value.year.toString().padLeft(4, '0')}-${value.month.toString().padLeft(2, '0')}-${value.day.toString().padLeft(2, '0')}',
      );
  }

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 14),
    child: TextFormField(
      controller: controller,
      readOnly: widget.date,
      onTap: widget.date ? date : null,
      keyboardType: widget.keyboard,
      minLines: widget.lines,
      maxLines: widget.lines == 1 ? 1 : 6,
      maxLength: 4000,
      decoration: InputDecoration(
        labelText: '${widget.label}${widget.required ? ' *' : ''}',
        border: const OutlineInputBorder(),
        counterText: '',
        suffixIcon: widget.date
            ? IconButton(
                tooltip: MaterialLocalizations.of(context).deleteButtonTooltip,
                onPressed: () => choose(''),
                icon: const Icon(Icons.clear),
              )
            : widget.options.isEmpty
            ? null
            : PopupMenuButton<String>(
                tooltip: widget.chooseLabel,
                onSelected: choose,
                itemBuilder: (_) => [
                  for (final item in widget.options)
                    PopupMenuItem<String>(
                      value: item['value'] as String,
                      child: Text(item['label'] as String),
                    ),
                ],
              ),
      ),
      validator: (value) => widget.required && (value?.trim().isEmpty ?? true)
          ? widget.requiredMessage
          : null,
      onChanged: widget.onChanged,
    ),
  );
}

class NativeCircumstances extends StatelessWidget {
  const NativeCircumstances({
    super.key,
    required this.vehicle,
    required this.copy,
    required this.onChanged,
  });
  final Map<String, dynamic> vehicle;
  final ReportCopy copy;
  final VoidCallback onChanged;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      if ((vehicle['circumstances'] as List? ?? []).isNotEmpty)
        Text(
          '${copy.finalText('legacy')}: ${(vehicle['circumstances'] as List).map((i) => (copy.dict['circumstances'] as List)[i as int]).join(' · ')}',
        ),
      for (var i = 0; i < copy.standard.length; i++)
        CheckboxListTile(
          contentPadding: EdgeInsets.zero,
          title: Text('${i + 1}. ${copy.standard[i]}'),
          value: (vehicle['standardCircumstances'] as List? ?? []).contains(i),
          onChanged: (value) {
            final selected =
                (vehicle['standardCircumstances'] ??= <int>[]) as List;
            if (value == true) {
              if (!selected.contains(i)) selected.add(i);
              selected.sort();
            } else {
              selected.remove(i);
            }
            vehicle['standardConfirmed'] = false;
            onChanged();
          },
        ),
      CheckboxListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(copy.finalText('confirmStandard')),
        value: vehicle['standardConfirmed'] == true,
        onChanged: (value) {
          vehicle['standardConfirmed'] = value == true;
          onChanged();
        },
      ),
    ],
  );
}

String appendNativeDamage(String value, String suggestion) {
  if (value.split('\n').any((line) => line.trim() == suggestion.trim()))
    return value;
  final next = '$value${value.isEmpty ? '' : '\n'}$suggestion';
  return next.length <= 4000 ? next : value;
}
